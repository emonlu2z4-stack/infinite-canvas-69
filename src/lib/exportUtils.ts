import type { CanvasElement, Camera } from '@/types/canvas';

// Re-render elements to a temporary canvas and export
function renderToCanvas(
  elements: CanvasElement[],
  padding = 40
): { canvas: HTMLCanvasElement; width: number; height: number } | null {
  if (elements.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  elements.forEach(el => {
    if ('points' in el && el.points.length > 0) {
      el.points.forEach(p => {
        minX = Math.min(minX, p.x - el.size);
        minY = Math.min(minY, p.y - el.size);
        maxX = Math.max(maxX, p.x + el.size);
        maxY = Math.max(maxY, p.y + el.size);
      });
    }
    if ('start' in el && 'end' in el) {
      minX = Math.min(minX, el.start.x, el.end.x);
      minY = Math.min(minY, el.start.y, el.end.y);
      maxX = Math.max(maxX, el.start.x, el.end.x);
      maxY = Math.max(maxY, el.start.y, el.end.y);
    }
    if ('position' in el) {
      minX = Math.min(minX, el.position.x);
      minY = Math.min(minY, el.position.y);
      const w = 'width' in el ? el.width : 200;
      const h = 'height' in el ? el.height : 100;
      maxX = Math.max(maxX, el.position.x + w);
      maxY = Math.max(maxY, el.position.y + h);
    }
  });

  if (!isFinite(minX)) return null;

  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.translate(-minX + padding, -minY + padding);

  // Import the draw function inline to avoid circular deps
  elements.forEach(el => drawElementExport(ctx, el));

  return { canvas, width, height };
}

function drawElementExport(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  ctx.save();

  if (el.type === 'pen' || el.type === 'highlighter') {
    if (el.points.length < 2) { ctx.restore(); return; }
    ctx.globalAlpha = el.opacity;
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
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
    ctx.ellipse(cx, cy, rx || 1, ry || 1, 0, 0, Math.PI * 2);
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
    ctx.fillStyle = el.color;
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fillRect(el.position.x, el.position.y, el.width, el.height);
    ctx.shadowColor = 'transparent';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#1a1a2e';
    ctx.textBaseline = 'top';
    const lines = el.content.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, el.position.x + 12, el.position.y + 12 + i * 20, el.width - 24);
    });
  }

  ctx.restore();
}

export function exportAsPNG(elements: CanvasElement[], boardName: string) {
  const result = renderToCanvas(elements);
  if (!result) return;

  const link = document.createElement('a');
  link.download = `${boardName}.png`;
  link.href = result.canvas.toDataURL('image/png');
  link.click();
}

export function exportAsPDF(elements: CanvasElement[], boardName: string) {
  const result = renderToCanvas(elements);
  if (!result) return;

  const imgData = result.canvas.toDataURL('image/png');

  // Create a simple PDF using a print window
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head><title>${boardName}</title>
    <style>
      body { margin: 0; display: flex; justify-content: center; align-items: center; }
      img { max-width: 100%; max-height: 100vh; }
      @media print { body { margin: 0; } img { max-width: 100%; } }
    </style></head>
    <body><img src="${imgData}" /></body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 300);
}

export function generateThumbnail(elements: CanvasElement[]): string | undefined {
  const result = renderToCanvas(elements, 20);
  if (!result) return undefined;

  // Scale down for thumbnail
  const thumbW = 320;
  const thumbH = 200;
  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = thumbW;
  thumbCanvas.height = thumbH;
  const tctx = thumbCanvas.getContext('2d')!;
  tctx.fillStyle = '#ffffff';
  tctx.fillRect(0, 0, thumbW, thumbH);

  const scale = Math.min(thumbW / result.width, thumbH / result.height);
  const dx = (thumbW - result.width * scale) / 2;
  const dy = (thumbH - result.height * scale) / 2;
  tctx.drawImage(result.canvas, dx, dy, result.width * scale, result.height * scale);

  return thumbCanvas.toDataURL('image/png', 0.6);
}
