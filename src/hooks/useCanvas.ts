import { useState, useCallback, useRef } from 'react';
import type { Camera, CanvasElement, Tool, Point } from '@/types/canvas';

export function useCanvas() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#1a1a2e');
  const [brushSize, setBrushSize] = useState(3);
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback((newElements: CanvasElement[]) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newElements];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const addElement = useCallback((el: CanvasElement) => {
    setElements(prev => {
      const next = [...prev, el];
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const eraseAt = useCallback((point: Point, radius: number) => {
    setElements(prev => {
      const next = prev.filter(el => {
        if (el.type === 'pen' || el.type === 'highlighter') {
          return !el.points.some(p =>
            Math.hypot(p.x - point.x, p.y - point.y) < radius
          );
        }
        if (el.type === 'rectangle' || el.type === 'circle' || el.type === 'arrow' || el.type === 'line') {
          const cx = (el.start.x + el.end.x) / 2;
          const cy = (el.start.y + el.end.y) / 2;
          return Math.hypot(cx - point.x, cy - point.y) >= radius;
        }
        if (el.type === 'text' || el.type === 'sticky') {
          return Math.hypot(el.position.x - point.x, el.position.y - point.y) >= radius;
        }
        return true;
      });
      if (next.length !== prev.length) pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  }, [history, historyIndex]);

  const screenToCanvas = useCallback((screenX: number, screenY: number): Point => {
    return {
      x: (screenX - camera.x) / camera.zoom,
      y: (screenY - camera.y) / camera.zoom,
    };
  }, [camera]);

  const zoom = useCallback((delta: number, cx: number, cy: number) => {
    setCamera(prev => {
      const factor = delta > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(5, Math.max(0.1, prev.zoom * factor));
      const ratio = newZoom / prev.zoom;
      return {
        x: cx - (cx - prev.x) * ratio,
        y: cy - (cy - prev.y) * ratio,
        zoom: newZoom,
      };
    });
  }, []);

  const pan = useCallback((dx: number, dy: number) => {
    setCamera(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const resetZoom = useCallback(() => {
    setCamera({ x: 0, y: 0, zoom: 1 });
  }, []);

  return {
    elements, setElements, camera, setCamera,
    activeTool, setActiveTool, color, setColor,
    brushSize, setBrushSize,
    addElement, eraseAt, undo, redo,
    screenToCanvas, zoom, pan, resetZoom,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}
