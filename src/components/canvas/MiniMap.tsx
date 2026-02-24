import React from 'react';
import type { Camera, CanvasElement } from '@/types/canvas';

interface MiniMapProps {
  elements: CanvasElement[];
  camera: Camera;
  canvasWidth: number;
  canvasHeight: number;
}

export default function MiniMap({ elements, camera, canvasWidth, canvasHeight }: MiniMapProps) {
  const mapW = 160;
  const mapH = 100;

  // Calculate bounds of all elements
  let minX = 0, minY = 0, maxX = canvasWidth, maxY = canvasHeight;
  elements.forEach(el => {
    if ('points' in el) {
      el.points.forEach(p => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
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
      maxX = Math.max(maxX, el.position.x + 200);
      maxY = Math.max(maxY, el.position.y + 100);
    }
  });

  const pad = 200;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const worldW = maxX - minX;
  const worldH = maxY - minY;
  const scale = Math.min(mapW / worldW, mapH / worldH);

  const vpX = (-camera.x / camera.zoom - minX) * scale;
  const vpY = (-camera.y / camera.zoom - minY) * scale;
  const vpW = (canvasWidth / camera.zoom) * scale;
  const vpH = (canvasHeight / camera.zoom) * scale;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden toolbar-shadow">
      <svg width={mapW} height={mapH} className="block">
        {/* Elements as dots */}
        {elements.map(el => {
          if ('points' in el && el.points.length > 0) {
            return (
              <circle
                key={el.id}
                cx={(el.points[0].x - minX) * scale}
                cy={(el.points[0].y - minY) * scale}
                r={1.5}
                fill={el.color}
                opacity={0.6}
              />
            );
          }
          if ('start' in el && 'end' in el) {
            const cx = ((el.start.x + el.end.x) / 2 - minX) * scale;
            const cy = ((el.start.y + el.end.y) / 2 - minY) * scale;
            return <circle key={el.id} cx={cx} cy={cy} r={1.5} fill={el.color} opacity={0.6} />;
          }
          return null;
        })}
        {/* Viewport rectangle */}
        <rect
          x={vpX} y={vpY} width={vpW} height={vpH}
          fill="hsl(224 76% 48% / 0.1)"
          stroke="hsl(224 76% 48% / 0.5)"
          strokeWidth={1.5}
          rx={2}
        />
      </svg>
    </div>
  );
}
