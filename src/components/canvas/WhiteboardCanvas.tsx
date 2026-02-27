import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useCanvasRenderer, getElementBounds } from './CanvasRenderer';
import type { CanvasElement, Point, Stroke, ShapeElement, ImageElement, Tool, CanvasTheme, CanvasPattern } from '@/types/canvas';
import type { ElementAnimation } from '@/hooks/useCanvasAnimation';

interface WhiteboardCanvasProps {
  elements: CanvasElement[];
  activeTool: Tool;
  color: string;
  brushSize: number;
  fillColor: string;
  borderRadius: number;
  camera: { x: number; y: number; zoom: number };
  onAddElement: (el: CanvasElement) => void;
  onEraseAt: (point: Point, radius: number) => void;
  onZoom: (delta: number, cx: number, cy: number) => void;
  onPan: (dx: number, dy: number) => void;
  screenToCanvas: (sx: number, sy: number) => Point;
  onTextAdd?: (position: Point) => void;
  onStickyAdd?: (position: Point) => void;
  onImageDrop?: (file: File, position: Point) => void;
  onImageAdd?: (position: Point) => void;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onMoveElement?: (id: string, dx: number, dy: number) => void;
  onCommitMove?: () => void;
  onResizeElement?: (id: string, handle: string, dx: number, dy: number) => void;
  onRotateElement?: (id: string, angle: number) => void;
  animation?: ElementAnimation;
  canvasTheme?: CanvasTheme;
  pattern?: CanvasPattern;
  patternSpacing?: number;
  patternOpacity?: number;
  patternColor?: string;
}

export default function WhiteboardCanvas({
  elements, activeTool, color, brushSize, fillColor, borderRadius,
  camera, onAddElement, onEraseAt, onZoom, onPan,
  screenToCanvas, onTextAdd, onStickyAdd, onImageDrop, onImageAdd,
  selectedElementId, onSelectElement, onMoveElement, onCommitMove, onResizeElement, onRotateElement,
  animation,
  canvasTheme,
  pattern,
  patternSpacing,
  patternOpacity,
  patternColor,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [currentShape, setCurrentShape] = useState<ShapeElement | null>(null);
  const lastPanPos = useRef<Point>({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const isDraggingElement = useRef(false);
  const isResizing = useRef(false);
  const isRotating = useRef(false);
  const rotateStartAngle = useRef(0);
  const rotateInitialRotation = useRef(0);
  const resizeHandle = useRef<string>('');
  const dragLastPos = useRef<Point>({ x: 0, y: 0 });
  const lastTouchDist = useRef<number>(0);
  const lastTouchCenter = useRef<Point>({ x: 0, y: 0 });
  const touchCount = useRef(0);

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
    selectedElementId,
    animation,
    canvasTheme,
    pattern,
    patternSpacing,
    patternOpacity,
    patternColor,
  });

  const getCanvasPointFromXY = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return screenToCanvas(clientX - rect.left, clientY - rect.top);
  }, [screenToCanvas]);

  const getCanvasPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return getCanvasPointFromXY(clientX, clientY);
  }, [getCanvasPointFromXY]);

  const hitTestElement = useCallback((point: Point): CanvasElement | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      const bounds = getElementBounds(el);
      if (!bounds) continue;
      const pad = 8;
      if (point.x >= bounds.x - pad && point.x <= bounds.x + bounds.w + pad &&
          point.y >= bounds.y - pad && point.y <= bounds.y + bounds.h + pad) {
        return el;
      }
    }
    return null;
  }, [elements]);

  const hitTestResizeHandle = useCallback((point: Point): string | null => {
    if (!selectedElementId) return null;
    const sel = elements.find(e => e.id === selectedElementId);
    if (!sel) return null;
    const bounds = getElementBounds(sel);
    if (!bounds) return null;
    const pad = 6;
    const handleSize = 8;
    const corners: [number, number, string][] = [
      [bounds.x - pad, bounds.y - pad, 'tl'],
      [bounds.x + bounds.w + pad, bounds.y - pad, 'tr'],
      [bounds.x - pad, bounds.y + bounds.h + pad, 'bl'],
      [bounds.x + bounds.w + pad, bounds.y + bounds.h + pad, 'br'],
    ];
    for (const [cx, cy, handle] of corners) {
      if (Math.abs(point.x - cx) <= handleSize && Math.abs(point.y - cy) <= handleSize) {
        return handle;
      }
    }
    return null;
  }, [elements, selectedElementId]);

  const hitTestRotationHandle = useCallback((point: Point): boolean => {
    if (!selectedElementId) return false;
    const sel = elements.find(e => e.id === selectedElementId);
    if (!sel) return false;
    if (sel.type !== 'rectangle' && sel.type !== 'circle' && sel.type !== 'arrow' && sel.type !== 'line') return false;
    const bounds = getElementBounds(sel);
    if (!bounds) return false;
    const pad = 6;
    const topCenterX = bounds.x + bounds.w / 2;
    const rotHandleY = bounds.y - pad - 25;
    return Math.hypot(point.x - topCenterX, point.y - rotHandleY) <= 10;
  }, [elements, selectedElementId]);

  const handlePointerDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) {
      setIsPanning(true);
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button !== 0) return;

    const point = getCanvasPoint(e);

    if (activeTool === 'select') {
      // Check rotation handle first
      if (hitTestRotationHandle(point)) {
        const sel = elements.find(e => e.id === selectedElementId);
        if (sel) {
          isRotating.current = true;
          const bounds = getElementBounds(sel);
          if (bounds) {
            const cx = bounds.x + bounds.w / 2;
            const cy = bounds.y + bounds.h / 2;
            rotateStartAngle.current = Math.atan2(point.y - cy, point.x - cx);
            rotateInitialRotation.current = (sel as ShapeElement).rotation ?? 0;
          }
          return;
        }
      }

      // Check resize handles
      const handle = hitTestResizeHandle(point);
      if (handle) {
        isResizing.current = true;
        resizeHandle.current = handle;
        dragLastPos.current = point;
        return;
      }

      const hit = hitTestElement(point);
      if (hit) {
        onSelectElement?.(hit.id);
        isDraggingElement.current = true;
        dragLastPos.current = point;
      } else {
        onSelectElement?.(null);
        setIsPanning(true);
        lastPanPos.current = { x: e.clientX, y: e.clientY };
      }
      return;
    }


    if (activeTool === 'text') {
      e.preventDefault();
      onTextAdd?.(point);
      return;
    }
    if (activeTool === 'sticky') {
      e.preventDefault();
      onStickyAdd?.(point);
      return;
    }
    if (activeTool === 'image') {
      onImageAdd?.(point);
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
        fill: fillColor || undefined,
        borderRadius: activeTool === 'rectangle' ? borderRadius : undefined,
      };
      setCurrentShape(shape);
      setIsDrawing(true);
    }
  }, [activeTool, color, brushSize, fillColor, borderRadius, getCanvasPoint, onEraseAt, onTextAdd, onStickyAdd, hitTestElement, hitTestResizeHandle, hitTestRotationHandle, onSelectElement, selectedElementId, elements]);

  const handlePointerMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPos.current.x;
      const dy = e.clientY - lastPanPos.current.y;
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      onPan(dx, dy);
      return;
    }

    if (isRotating.current && selectedElementId) {
      const point = getCanvasPoint(e);
      const sel = elements.find(el => el.id === selectedElementId);
      if (sel) {
        const bounds = getElementBounds(sel);
        if (bounds) {
          const cx = bounds.x + bounds.w / 2;
          const cy = bounds.y + bounds.h / 2;
          const currentAngle = Math.atan2(point.y - cy, point.x - cx);
          const newRotation = rotateInitialRotation.current + (currentAngle - rotateStartAngle.current);
          onRotateElement?.(selectedElementId, newRotation);
        }
      }
      return;
    }

    if (isResizing.current && selectedElementId) {
      const point = getCanvasPoint(e);
      const dx = point.x - dragLastPos.current.x;
      const dy = point.y - dragLastPos.current.y;
      dragLastPos.current = point;
      onResizeElement?.(selectedElementId, resizeHandle.current, dx, dy);
      return;
    }

    if (isDraggingElement.current && selectedElementId) {
      const point = getCanvasPoint(e);
      const dx = point.x - dragLastPos.current.x;
      const dy = point.y - dragLastPos.current.y;
      dragLastPos.current = point;
      onMoveElement?.(selectedElementId, dx, dy);
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
  }, [isPanning, isDrawing, currentStroke, currentShape, activeTool, brushSize, getCanvasPoint, onPan, onEraseAt, selectedElementId, onMoveElement, onResizeElement, onRotateElement, elements]);

  const handlePointerUp = useCallback(() => {
    if (isRotating.current) {
      isRotating.current = false;
      onCommitMove?.();
      return;
    }
    if (isResizing.current) {
      isResizing.current = false;
      resizeHandle.current = '';
      onCommitMove?.();
      return;
    }
    if (isDraggingElement.current) {
      isDraggingElement.current = false;
      onCommitMove?.();
      return;
    }
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
  }, [isPanning, currentStroke, currentShape, onAddElement, onCommitMove]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      onZoom(e.deltaY, e.clientX, e.clientY);
    } else {
      onPan(-e.deltaX, -e.deltaY);
    }
  }, [onZoom, onPan]);

  const cursorClass = activeTool === 'select'
    ? (isResizing.current ? 'cursor-nwse-resize' : isDraggingElement.current ? 'cursor-grabbing' : 'cursor-grab')
    : activeTool === 'eraser' ? 'cursor-crosshair'
    : activeTool === 'text' ? 'cursor-text'
    : activeTool === 'image' ? 'cursor-copy' : 'cursor-crosshair';

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const point = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    files.forEach((file, i) => {
      onImageDrop?.(file, { x: point.x + i * 20, y: point.y + i * 20 });
    });
  }, [screenToCanvas, onImageDrop]);

  // Touch helpers
  const getTouchDist = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const getTouchCenter = (touches: React.TouchList): Point => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    touchCount.current = e.touches.length;

    if (e.touches.length === 2) {
      // Two-finger: start pinch/pan — cancel any drawing
      setCurrentStroke(null);
      setCurrentShape(null);
      setIsDrawing(false);
      lastTouchDist.current = getTouchDist(e.touches);
      lastTouchCenter.current = getTouchCenter(e.touches);
      setIsPanning(true);
      return;
    }

    if (e.touches.length === 1) {
      // Single finger: draw or pan depending on tool
      const t = e.touches[0];
      if (activeTool === 'select') {
        setIsPanning(true);
        lastPanPos.current = { x: t.clientX, y: t.clientY };
        return;
      }

      const point = getCanvasPointFromXY(t.clientX, t.clientY);

      if (activeTool === 'text') { onTextAdd?.(point); return; }
      if (activeTool === 'sticky') { onStickyAdd?.(point); return; }
      if (activeTool === 'image') { onImageAdd?.(point); return; }

      if (activeTool === 'pen' || activeTool === 'highlighter') {
        const stroke: Stroke = {
          id: crypto.randomUUID(),
          type: activeTool,
          points: [point],
          color,
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
          fill: fillColor || undefined,
          borderRadius: activeTool === 'rectangle' ? borderRadius : undefined,
        };
        setCurrentShape(shape);
        setIsDrawing(true);
      }
    }
  }, [activeTool, color, brushSize, getCanvasPointFromXY, onEraseAt, onTextAdd, onStickyAdd]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 2) {
      // Pinch zoom + two-finger pan
      const dist = getTouchDist(e.touches);
      const center = getTouchCenter(e.touches);

      if (lastTouchDist.current > 0) {
        const delta = lastTouchDist.current - dist;
        onZoom(delta, center.x, center.y);
      }

      const dx = center.x - lastTouchCenter.current.x;
      const dy = center.y - lastTouchCenter.current.y;
      onPan(dx, dy);

      lastTouchDist.current = dist;
      lastTouchCenter.current = center;
      return;
    }

    if (e.touches.length === 1) {
      const t = e.touches[0];

      if (isPanning) {
        const dx = t.clientX - lastPanPos.current.x;
        const dy = t.clientY - lastPanPos.current.y;
        lastPanPos.current = { x: t.clientX, y: t.clientY };
        onPan(dx, dy);
        return;
      }

      if (!isDrawing) return;
      const point = getCanvasPointFromXY(t.clientX, t.clientY);

      if (currentStroke) {
        setCurrentStroke(prev => prev ? { ...prev, points: [...prev.points, point] } : null);
      }
      if (currentShape) {
        setCurrentShape(prev => prev ? { ...prev, end: point } : null);
      }
      if (activeTool === 'eraser') {
        onEraseAt(point, brushSize * 3);
      }
    }
  }, [isPanning, isDrawing, currentStroke, currentShape, activeTool, brushSize, getCanvasPointFromXY, onPan, onZoom, onEraseAt]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      // All fingers lifted
      if (touchCount.current <= 1) {
        // Was single-finger interaction
        if (isPanning) {
          setIsPanning(false);
        } else {
          if (currentStroke && currentStroke.points.length > 1) {
            onAddElement(currentStroke);
          }
          if (currentShape) {
            onAddElement(currentShape);
          }
          setCurrentStroke(null);
          setCurrentShape(null);
          setIsDrawing(false);
        }
      } else {
        // Was multi-finger (pinch/pan)
        setIsPanning(false);
        lastTouchDist.current = 0;
      }
      touchCount.current = 0;
    } else if (e.touches.length === 1 && touchCount.current === 2) {
      // Went from 2 fingers to 1 — keep panning with single finger
      lastPanPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, [isPanning, currentStroke, currentShape, onAddElement]);

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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
      {isDragOver && (
        <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center transition-all duration-200">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px]" />
          {/* Animated border */}
          <div className="absolute inset-4 border-[3px] border-dashed border-primary/50 rounded-2xl animate-pulse" />
          {/* Center content */}
          <div className="relative flex flex-col items-center gap-3 bg-background/90 backdrop-blur-sm px-8 py-6 rounded-xl shadow-lg border border-border">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-foreground font-semibold text-base">Drop image here</p>
              <p className="text-muted-foreground text-sm mt-0.5">PNG, JPG, SVG, GIF supported</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
