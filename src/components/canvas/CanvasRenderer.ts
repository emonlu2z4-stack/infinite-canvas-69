import { useRef, useEffect, useCallback } from 'react';
import type { CanvasElement, Camera, ImageElement, CanvasTheme, CanvasPattern } from '@/types/canvas';
import { CANVAS_THEME_COLORS } from '@/types/canvas';
import type { ElementAnimation } from '@/hooks/useCanvasAnimation';

// Cache loaded HTMLImageElement objects by src
const imageCache = new Map<string, HTMLImageElement>();

function getOrLoadImage(src: string): HTMLImageElement | null {
  if (imageCache.has(src)) return imageCache.get(src)!;
  const img = new Image();
  img.src = src;
  img.onload = () => imageCache.set(src, img);
  if (img.complete) {
    imageCache.set(src, img);
    return img;
  }
  return null;
}

function drawElement(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  ctx.save();

  if (el.type === 'pen' || el.type === 'highlighter') {
    if (el.points.length < 2) { ctx.restore(); return; }
    ctx.globalAlpha = el.opacity;
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (el.type === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
    }
    ctx.beginPath();
    ctx.moveTo(el.points[0].x, el.points[0].y);
    for (let i = 1; i < el.points.length; i++) {
      const prev = el.points[i - 1];
      const curr = el.points[i];
      const mx = (prev.x + curr.x) / 2;
      const my = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
    }
    ctx.stroke();
  }

  if (el.type === 'rectangle') {
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.size;
    ctx.lineJoin = 'round';
    const x = Math.min(el.start.x, el.end.x);
    const y = Math.min(el.start.y, el.end.y);
    const w = Math.abs(el.end.x - el.start.x);
    const h = Math.abs(el.end.y - el.start.y);
    if (el.fill) { ctx.fillStyle = el.fill; ctx.fillRect(x, y, w, h); }
    ctx.strokeRect(x, y, w, h);
  }

  if (el.type === 'circle') {
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.size;
    const cx = (el.start.x + el.end.x) / 2;
    const cy = (el.start.y + el.end.y) / 2;
    const rx = Math.abs(el.end.x - el.start.x) / 2;
    const ry = Math.abs(el.end.y - el.start.y) / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    if (el.fill) { ctx.fillStyle = el.fill; ctx.fill(); }
    ctx.stroke();
  }

  if (el.type === 'line') {
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.size;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(el.start.x, el.start.y);
    ctx.lineTo(el.end.x, el.end.y);
    ctx.stroke();
  }

  if (el.type === 'arrow') {
    ctx.strokeStyle = el.color;
    ctx.fillStyle = el.color;
    ctx.lineWidth = el.size;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(el.start.x, el.start.y);
    ctx.lineTo(el.end.x, el.end.y);
    ctx.stroke();
    // arrowhead
    const angle = Math.atan2(el.end.y - el.start.y, el.end.x - el.start.x);
    const headLen = Math.max(10, el.size * 4);
    ctx.beginPath();
    ctx.moveTo(el.end.x, el.end.y);
    ctx.lineTo(el.end.x - headLen * Math.cos(angle - 0.4), el.end.y - headLen * Math.sin(angle - 0.4));
    ctx.lineTo(el.end.x - headLen * Math.cos(angle + 0.4), el.end.y - headLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  if (el.type === 'text') {
    ctx.font = `${el.fontStyle} ${el.fontWeight} ${el.fontSize}px Inter, sans-serif`;
    ctx.fillStyle = el.color;
    ctx.textBaseline = 'top';
    const lines = el.content.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, el.position.x, el.position.y + i * el.fontSize * 1.3);
    });
  }

  if (el.type === 'sticky') {
    const { position, width, height, color: bgColor, content } = el;
    ctx.fillStyle = bgColor;
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fillRect(position.x, position.y, width, height);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(position.x, position.y, width, height);
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#1a1a2e';
    ctx.textBaseline = 'top';
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, position.x + 12, position.y + 12 + i * 20, width - 24);
    });
  }

  if (el.type === 'image') {
    const img = getOrLoadImage(el.src);
    if (img) {
      ctx.drawImage(img, el.position.x, el.position.y, el.width, el.height);
    } else {
      // Placeholder while loading
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(el.position.x, el.position.y, el.width, el.height);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(el.position.x, el.position.y, el.width, el.height);
    }
  }

  ctx.restore();
}

function drawPattern(ctx: CanvasRenderingContext2D, camera: Camera, width: number, height: number, pattern: CanvasPattern, gridColor: string) {
  if (pattern === 'none') return;
  const spacing = 40;
  ctx.save();
  ctx.strokeStyle = gridColor;
  ctx.fillStyle = gridColor;
  ctx.lineWidth = 1;

  const startX = Math.floor(-camera.x / camera.zoom / spacing) * spacing;
  const startY = Math.floor(-camera.y / camera.zoom / spacing) * spacing;
  const endX = startX + width / camera.zoom + spacing * 2;
  const endY = startY + height / camera.zoom + spacing * 2;

  if (pattern === 'grid') {
    for (let x = startX; x < endX; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, endY); ctx.stroke();
    }
    for (let y = startY; y < endY; y += spacing) {
      ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke();
    }
  }

  if (pattern === 'dots') {
    const r = 1.5;
    for (let x = startX; x < endX; x += spacing) {
      for (let y = startY; y < endY; y += spacing) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  if (pattern === 'lines') {
    for (let y = startY; y < endY; y += spacing) {
      ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke();
    }
  }

  if (pattern === 'iso') {
    const h = spacing * Math.sqrt(3) / 2;
    ctx.lineWidth = 0.7;
    for (let x = startX - (endY - startY); x < endX + (endY - startY); x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x + (endY - startY) / Math.tan(Math.PI / 3), endY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x - (endY - startY) / Math.tan(Math.PI / 3), endY); ctx.stroke();
    }
    for (let y = startY; y < endY; y += h) {
      ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke();
    }
  }

  ctx.restore();
}

interface CanvasRendererProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  elements: CanvasElement[];
  camera: Camera;
  width: number;
  height: number;
  activeElement?: CanvasElement | null;
  selectedElementId?: string | null;
  animation?: ElementAnimation;
  canvasTheme?: CanvasTheme;
  pattern?: CanvasPattern;
}

function getElementBounds(el: CanvasElement): { x: number; y: number; w: number; h: number } | null {
  if (el.type === 'pen' || el.type === 'highlighter') {
    if (el.points.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    el.points.forEach(p => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }
  if (el.type === 'rectangle' || el.type === 'circle' || el.type === 'arrow' || el.type === 'line') {
    const x = Math.min(el.start.x, el.end.x);
    const y = Math.min(el.start.y, el.end.y);
    return { x, y, w: Math.abs(el.end.x - el.start.x), h: Math.abs(el.end.y - el.start.y) };
  }
  if (el.type === 'text' || el.type === 'sticky' || el.type === 'image') {
    return { x: el.position.x, y: el.position.y, w: el.width, h: el.height };
  }
  return null;
}

export { getElementBounds };

function drawSelectionBox(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  const bounds = getElementBounds(el);
  if (!bounds) return;
  const pad = 6;
  ctx.save();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);
  ctx.strokeRect(bounds.x - pad, bounds.y - pad, bounds.w + pad * 2, bounds.h + pad * 2);
  ctx.setLineDash([]);
  // Corner handles
  const size = 6;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.5;
  const corners = [
    [bounds.x - pad, bounds.y - pad],
    [bounds.x + bounds.w + pad, bounds.y - pad],
    [bounds.x - pad, bounds.y + bounds.h + pad],
    [bounds.x + bounds.w + pad, bounds.y + bounds.h + pad],
  ];
  corners.forEach(([cx, cy]) => {
    ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
    ctx.strokeRect(cx - size / 2, cy - size / 2, size, size);
  });
  ctx.restore();
}

export function useCanvasRenderer({ canvasRef, elements, camera, width, height, activeElement, selectedElementId, animation, canvasTheme = 'light', pattern = 'grid' }: CanvasRendererProps) {
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const themeColors = CANVAS_THEME_COLORS[canvasTheme];
    ctx.fillStyle = themeColors.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    drawPattern(ctx, camera, width, height, pattern, themeColors.gridColor);

    elements.forEach(el => {
      const progress = animation?.progress.get(el.id);
      if (progress !== undefined && progress < 1) {
        ctx.save();
        ctx.globalAlpha = progress;
        const bounds = getElementBounds(el);
        if (bounds) {
          const cx = bounds.x + bounds.w / 2;
          const cy = bounds.y + bounds.h / 2;
          const s = 0.85 + 0.15 * progress;
          ctx.translate(cx, cy);
          ctx.scale(s, s);
          ctx.translate(-cx, -cy);
        }
        drawElement(ctx, el);
        ctx.restore();
      } else {
        drawElement(ctx, el);
      }
    });
    if (activeElement) drawElement(ctx, activeElement);

    if (selectedElementId) {
      const sel = elements.find(e => e.id === selectedElementId);
      if (sel) drawSelectionBox(ctx, sel);
    }

    ctx.restore();
  }, [canvasRef, elements, camera, width, height, activeElement, selectedElementId, animation, canvasTheme, pattern]);

  useEffect(() => {
    const id = requestAnimationFrame(render);
    return () => cancelAnimationFrame(id);
  }, [render]);

  return { render };
}
