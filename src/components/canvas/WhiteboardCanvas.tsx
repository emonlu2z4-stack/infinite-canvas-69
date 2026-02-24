import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useCanvasRenderer } from './CanvasRenderer';
import type { CanvasElement, Point, Stroke, ShapeElement, Tool } from '@/types/canvas';

interface WhiteboardCanvasProps {
  elements: CanvasElement[];
  activeTool: Tool;
  color: string;
  brushSize: number;
  camera: { x: number; y: number; zoom: number };
  onAddElement: (el: CanvasElement) => void;
  onEraseAt: (point: Point, radius: number) => void;
  onZoom: (delta: number, cx: number, cy: number) => void;
  onPan: (dx: number, dy: number) => void;
  screenToCanvas: (sx: number, sy: number) => Point;
  onTextAdd?: (position: Point) => void;
  onStickyAdd?: (position: Point) => void;
}

export default function WhiteboardCanvas({
  elements, activeTool, color, brushSize,
  camera, onAddElement, onEraseAt, onZoom, onPan,
  screenToCanvas, onTextAdd, onStickyAdd,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [currentShape, setCurrentShape] = useState<ShapeElement | null>(null);
  const lastPanPos = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeElement = currentStroke || currentShape || null;

  useCanvasRenderer({
    canvasRef, elements, camera,
    width: size.width, height: size.height,
    activeElement,
  });

  const getCanvasPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return screenToCanvas(clientX - rect.left, clientY - rect.top);
  }, [screenToCanvas]);

  const getScreenPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX, y: clientY };
  }, []);

  const handlePointerDown = useCallback((e: React.MouseEvent) => {
    // Middle mouse or space+click = pan
    if (e.button === 1 || (e.button === 0 && activeTool === 'select')) {
      setIsPanning(true);
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button !== 0) return;

    const point = getCanvasPoint(e);

    if (activeTool === 'text') {
      onTextAdd?.(point);
      return;
    }
    if (activeTool === 'sticky') {
      onStickyAdd?.(point);
      return;
    }

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      const stroke: Stroke = {
        id: crypto.randomUUID(),
        type: activeTool,
        points: [point],
        color: activeTool === 'highlighter' ? color : color,
        size: activeTool === 'highlighter' ? brushSize * 3 : brushSize,
        opacity: activeTool === 'highlighter' ? 0.4 : 1,
      };
      setCurrentStroke(stroke);
      setIsDrawing(true);
    }

    if (activeTool === 'eraser') {
      setIsDrawing(true);
      onEraseAt(point, brushSize * 3);
    }

    if (['rectangle', 'circle', 'arrow', 'line'].includes(activeTool)) {
      const shape: ShapeElement = {
        id: crypto.randomUUID(),
        type: activeTool as ShapeElement['type'],
        start: point,
        end: point,
        color,
        size: brushSize,
      };
      setCurrentShape(shape);
      setIsDrawing(true);
    }
  }, [activeTool, color, brushSize, getCanvasPoint, onEraseAt, onTextAdd, onStickyAdd]);

  const handlePointerMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPos.current.x;
      const dy = e.clientY - lastPanPos.current.y;
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      onPan(dx, dy);
      return;
    }

    if (!isDrawing) return;
    const point = getCanvasPoint(e);

    if (currentStroke) {
      setCurrentStroke(prev => prev ? { ...prev, points: [...prev.points, point] } : null);
    }
    if (currentShape) {
      setCurrentShape(prev => prev ? { ...prev, end: point } : null);
    }
    if (activeTool === 'eraser') {
      onEraseAt(point, brushSize * 3);
    }
  }, [isPanning, isDrawing, currentStroke, currentShape, activeTool, brushSize, getCanvasPoint, onPan, onEraseAt]);

  const handlePointerUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (currentStroke && currentStroke.points.length > 1) {
      onAddElement(currentStroke);
    }
    if (currentShape) {
      onAddElement(currentShape);
    }
    setCurrentStroke(null);
    setCurrentShape(null);
    setIsDrawing(false);
  }, [isPanning, currentStroke, currentShape, onAddElement]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      onZoom(e.deltaY, e.clientX, e.clientY);
    } else {
      onPan(-e.deltaX, -e.deltaY);
    }
  }, [onZoom, onPan]);

  const cursorClass = activeTool === 'select' ? 'cursor-grab' :
    activeTool === 'eraser' ? 'cursor-crosshair' :
    activeTool === 'text' ? 'cursor-text' : 'cursor-crosshair';

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 touch-none ${cursorClass}`}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onWheel={handleWheel}
      />
    </div>
  );
}
