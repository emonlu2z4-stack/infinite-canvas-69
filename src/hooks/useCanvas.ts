import { useState, useCallback, useRef, useEffect } from 'react';
import type { Camera, CanvasElement, Tool, Point } from '@/types/canvas';

function getForegroundColor(): string {
  const fg = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim();
  if (fg) {
    // Convert HSL values to hex for canvas rendering
    const canvas = document.createElement('canvas');
    canvas.width = 1; canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = `hsl(${fg})`;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }
  return '#1a1a2e';
}

export function useCanvas() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [color, setColor] = useState(getForegroundColor);
  const [brushSize, setBrushSize] = useState(3);
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const userPickedColor = useRef(false);

  // Update default color when theme changes
  useEffect(() => {
    if (userPickedColor.current) return;
    const observer = new MutationObserver(() => {
      setColor(getForegroundColor());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleColorChange = useCallback((c: string) => {
    userPickedColor.current = true;
    setColor(c);
  }, []);
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

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const moveElement = useCallback((id: string, dx: number, dy: number) => {
    setElements(prev => prev.map(el => {
      if (el.id !== id) return el;
      if (el.type === 'pen' || el.type === 'highlighter') {
        return { ...el, points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
      }
      if (el.type === 'rectangle' || el.type === 'circle' || el.type === 'arrow' || el.type === 'line') {
        return { ...el, start: { x: el.start.x + dx, y: el.start.y + dy }, end: { x: el.end.x + dx, y: el.end.y + dy } };
      }
      if (el.type === 'text' || el.type === 'sticky' || el.type === 'image') {
        return { ...el, position: { x: el.position.x + dx, y: el.position.y + dy } };
      }
      return el;
    }));
  }, []);

  const commitMove = useCallback(() => {
    setElements(prev => {
      pushHistory(prev);
      return prev;
    });
  }, [pushHistory]);

  const deleteSelected = useCallback(() => {
    if (!selectedElementId) return;
    setElements(prev => {
      const next = prev.filter(el => el.id !== selectedElementId);
      pushHistory(next);
      return next;
    });
    setSelectedElementId(null);
  }, [selectedElementId, pushHistory]);

  const resizeElement = useCallback((id: string, handle: string, dx: number, dy: number) => {
    setElements(prev => prev.map(el => {
      if (el.id !== id) return el;

      if (el.type === 'rectangle' || el.type === 'circle' || el.type === 'arrow' || el.type === 'line') {
        const updated = { ...el, start: { ...el.start }, end: { ...el.end } };
        if (handle.includes('l')) updated.start.x += dx;
        if (handle.includes('r')) updated.end.x += dx;
        if (handle.includes('t')) updated.start.y += dy;
        if (handle.includes('b')) updated.end.y += dy;
        return updated;
      }

      if (el.type === 'text' || el.type === 'sticky') {
        const updated = { ...el, position: { ...el.position } };
        if (handle.includes('l')) { updated.position.x += dx; updated.width -= dx; }
        if (handle.includes('r')) { updated.width += dx; }
        if (handle.includes('t')) { updated.position.y += dy; updated.height -= dy; }
        if (handle.includes('b')) { updated.height += dy; }
        updated.width = Math.max(20, updated.width);
        updated.height = Math.max(20, updated.height);
        return updated;
      }

      if (el.type === 'image') {
        const aspect = el.naturalWidth / el.naturalHeight;
        const updated = { ...el, position: { ...el.position } };
        if (handle === 'br') {
          updated.width += dx;
          updated.width = Math.max(20, updated.width);
          updated.height = updated.width / aspect;
        } else if (handle === 'bl') {
          updated.position.x += dx;
          updated.width -= dx;
          updated.width = Math.max(20, updated.width);
          updated.height = updated.width / aspect;
        } else if (handle === 'tr') {
          updated.position.y += dy;
          updated.height -= dy;
          updated.height = Math.max(20, updated.height);
          updated.width = updated.height * aspect;
        } else if (handle === 'tl') {
          updated.position.x += dx;
          updated.position.y += dy;
          updated.width -= dx;
          updated.width = Math.max(20, updated.width);
          updated.height = updated.width / aspect;
        }
        return updated;
      }

      if (el.type === 'pen' || el.type === 'highlighter') {
        // Scale stroke points within bounds
        if (el.points.length === 0) return el;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        el.points.forEach(p => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
        const ow = maxX - minX || 1;
        const oh = maxY - minY || 1;
        let nMinX = minX, nMinY = minY, nMaxX = maxX, nMaxY = maxY;
        if (handle.includes('l')) nMinX += dx;
        if (handle.includes('r')) nMaxX += dx;
        if (handle.includes('t')) nMinY += dy;
        if (handle.includes('b')) nMaxY += dy;
        const nw = Math.max(5, nMaxX - nMinX);
        const nh = Math.max(5, nMaxY - nMinY);
        return {
          ...el,
          points: el.points.map(p => ({
            x: nMinX + ((p.x - minX) / ow) * nw,
            y: nMinY + ((p.y - minY) / oh) * nh,
          })),
        };
      }

      return el;
    }));
  }, []);

  const rotateElement = useCallback((id: string, angle: number) => {
    setElements(prev => prev.map(el => {
      if (el.id !== id) return el;
      if (el.type === 'rectangle' || el.type === 'circle' || el.type === 'arrow' || el.type === 'line') {
        return { ...el, rotation: angle };
      }
      return el;
    }));
  }, []);

  const updateElementProperty = useCallback((id: string, props: Record<string, unknown>) => {
    setElements(prev => {
      const next = prev.map(el => el.id === id ? { ...el, ...props } as CanvasElement : el);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  return {
    elements, setElements, camera, setCamera,
    activeTool, setActiveTool, color, setColor: handleColorChange,
    brushSize, setBrushSize,
    addElement, eraseAt, undo, redo,
    screenToCanvas, zoom, pan, resetZoom,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    selectedElementId, setSelectedElementId,
    moveElement, commitMove, deleteSelected, resizeElement,
    rotateElement, updateElementProperty,
  };
}
