import React, { useState, useRef, useEffect } from 'react';
import type { Point, TextElement, StickyNote } from '@/types/canvas';
import { STICKY_COLORS } from '@/types/canvas';

interface TextOverlayProps {
  position: Point;
  camera: { x: number; y: number; zoom: number };
  onSubmit: (el: TextElement) => void;
  onCancel: () => void;
  color: string;
}

export function TextInput({ position, camera, onSubmit, onCancel, color }: TextOverlayProps) {
  const [content, setContent] = useState('');
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null!);

  useEffect(() => {
    // Delay focus slightly to ensure DOM is ready
    const timer = setTimeout(() => {
      ref.current?.focus();
      setMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const screenX = position.x * camera.zoom + camera.x;
  const screenY = position.y * camera.zoom + camera.y;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (content.trim()) {
        onSubmit({
          id: crypto.randomUUID(),
          type: 'text',
          position,
          content: content.trim(),
          fontSize: 16,
          fontWeight: 'normal',
          fontStyle: 'normal',
          color,
          width: 200,
          height: 30,
        });
      } else {
        onCancel();
      }
    }
    if (e.key === 'Escape') onCancel();
  };

  return (
    <textarea
      ref={ref}
      value={content}
      onChange={e => setContent(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        if (!mounted) return;
        // Small delay to avoid instant cancel on render
        setTimeout(() => {
          if (content.trim()) {
            onSubmit({
              id: crypto.randomUUID(),
              type: 'text',
              position,
              content: content.trim(),
              fontSize: 16,
              fontWeight: 'normal',
              fontStyle: 'normal',
              color,
              width: 200,
              height: 30,
            });
          } else {
            onCancel();
          }
        }, 150);
      }}
      className="absolute z-50 bg-card border-2 border-primary rounded px-2 py-1 outline-none resize-none text-base min-w-[160px] shadow-lg"
      style={{
        left: screenX,
        top: screenY,
        color,
        fontSize: 16 * camera.zoom,
      }}
      rows={2}
      placeholder="Type here..."
    />
  );
}

interface StickyInputProps {
  position: Point;
  camera: { x: number; y: number; zoom: number };
  onSubmit: (el: StickyNote) => void;
  onCancel: () => void;
}

export function StickyInput({ position, camera, onSubmit, onCancel }: StickyInputProps) {
  const [content, setContent] = useState('');
  const [stickyColor, setStickyColor] = useState(STICKY_COLORS[0]);
  const ref = useRef<HTMLTextAreaElement>(null!);

  useEffect(() => { ref.current?.focus(); }, []);

  const screenX = position.x * camera.zoom + camera.x;
  const screenY = position.y * camera.zoom + camera.y;

  const submit = () => {
    onSubmit({
      id: crypto.randomUUID(),
      type: 'sticky',
      position,
      content: content.trim() || 'Note',
      color: stickyColor,
      width: 180,
      height: 140,
    });
  };

  return (
    <div
      className="absolute z-50 rounded-lg shadow-lg border border-border/50 overflow-hidden"
      style={{
        left: screenX,
        top: screenY,
        backgroundColor: stickyColor,
        width: 180 * camera.zoom,
      }}
    >
      <div className="flex gap-1 p-2 border-b border-black/5">
        {STICKY_COLORS.map(c => (
          <button
            key={c}
            onClick={() => setStickyColor(c)}
            className={`w-4 h-4 rounded-full border ${stickyColor === c ? 'border-gray-600 scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <textarea
        ref={ref}
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          if (e.key === 'Escape') onCancel();
        }}
        onBlur={submit}
        className="w-full bg-transparent border-none outline-none resize-none p-3 text-sm"
        style={{ color: '#1a1a2e', minHeight: 80 }}
        placeholder="Write a note..."
      />
    </div>
  );
}
