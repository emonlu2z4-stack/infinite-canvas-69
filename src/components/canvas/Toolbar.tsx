import React from 'react';
import {
  Pencil, Highlighter, Eraser, Square, Circle,
  ArrowRight, Minus, Type, StickyNote, MousePointer2,
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Tool } from '@/types/canvas';
import { COLORS } from '@/types/canvas';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  color: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

const tools: { id: Tool; icon: React.ElementType; label: string; shortcut: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'pen', icon: Pencil, label: 'Pen', shortcut: 'B' },
  { id: 'highlighter', icon: Highlighter, label: 'Highlighter', shortcut: 'H' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
  { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow', shortcut: 'A' },
  { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'sticky', icon: StickyNote, label: 'Sticky Note', shortcut: 'S' },
];

export default function Toolbar({
  activeTool, onToolChange, color, onColorChange,
  brushSize, onBrushSizeChange,
  onUndo, onRedo, canUndo, canRedo,
  zoom, onZoomIn, onZoomOut, onResetZoom,
}: ToolbarProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-toolbar border border-toolbar-border rounded-xl px-2 py-1.5 toolbar-shadow">
      {/* Drawing tools */}
      {tools.map(tool => (
        <Tooltip key={tool.id}>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToolChange(tool.id)}
              className={`p-2 rounded-lg transition-all duration-150 ${
                activeTool === tool.id
                  ? 'bg-toolbar-active text-primary-foreground shadow-sm'
                  : 'text-toolbar-foreground hover:bg-toolbar-hover'
              }`}
            >
              <tool.icon size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {tool.label} <kbd className="ml-1 px-1 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">{tool.shortcut}</kbd>
          </TooltipContent>
        </Tooltip>
      ))}

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Color picker */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-1.5 rounded-lg hover:bg-toolbar-hover transition-colors">
            <div
              className="w-5 h-5 rounded-full border-2 border-toolbar-border"
              style={{ backgroundColor: color }}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" side="bottom">
          <div className="grid grid-cols-4 gap-1.5">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === c ? 'border-primary scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Brush size */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-1.5 rounded-lg hover:bg-toolbar-hover transition-colors flex items-center gap-1">
            <div className="flex items-center justify-center w-5 h-5">
              <div
                className="rounded-full bg-toolbar-foreground"
                style={{ width: Math.max(4, brushSize * 2), height: Math.max(4, brushSize * 2) }}
              />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3" side="bottom">
          <p className="text-xs text-muted-foreground mb-2">Brush Size: {brushSize}px</p>
          <Slider
            value={[brushSize]}
            onValueChange={([v]) => onBrushSizeChange(v)}
            min={1}
            max={20}
            step={1}
          />
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Undo / Redo */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg text-toolbar-foreground hover:bg-toolbar-hover disabled:opacity-30 transition-all"
          >
            <Undo2 size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Undo <kbd className="ml-1 px-1 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">⌘Z</kbd></TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg text-toolbar-foreground hover:bg-toolbar-hover disabled:opacity-30 transition-all"
          >
            <Redo2 size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Redo <kbd className="ml-1 px-1 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">⌘⇧Z</kbd></TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Zoom controls */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onZoomOut} className="p-2 rounded-lg text-toolbar-foreground hover:bg-toolbar-hover transition-all">
            <ZoomOut size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Zoom Out</TooltipContent>
      </Tooltip>

      <button
        onClick={onResetZoom}
        className="px-2 py-1 text-xs font-medium text-toolbar-foreground hover:bg-toolbar-hover rounded-md transition-all min-w-[3rem]"
      >
        {Math.round(zoom * 100)}%
      </button>

      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onZoomIn} className="p-2 rounded-lg text-toolbar-foreground hover:bg-toolbar-hover transition-all">
            <ZoomIn size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Zoom In</TooltipContent>
      </Tooltip>
    </div>
  );
}
