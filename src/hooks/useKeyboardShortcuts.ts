import { useEffect } from 'react';
import type { Tool } from '@/types/canvas';

interface UseKeyboardShortcutsProps {
  onToolChange: (tool: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function useKeyboardShortcuts({ onToolChange, onUndo, onRedo }: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      if ((e.metaKey || e.ctrlKey) && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) onRedo();
        else onUndo();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && key === 'y') {
        e.preventDefault();
        onRedo();
        return;
      }

      const toolMap: Record<string, Tool> = {
        v: 'select', b: 'pen', h: 'highlighter', e: 'eraser',
        r: 'rectangle', c: 'circle', a: 'arrow', l: 'line',
        t: 'text', s: 'sticky',
      };

      if (!e.metaKey && !e.ctrlKey && !e.altKey && toolMap[key]) {
        onToolChange(toolMap[key]);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onToolChange, onUndo, onRedo]);
}
