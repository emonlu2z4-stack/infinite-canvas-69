import React from 'react';
import { Settings2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import type { CanvasTheme, CanvasPattern } from '@/types/canvas';

interface CanvasSettingsPanelProps {
  canvasTheme: CanvasTheme;
  pattern: CanvasPattern;
  patternSpacing: number;
  onThemeChange: (t: CanvasTheme) => void;
  onPatternChange: (p: CanvasPattern) => void;
  onPatternSpacingChange: (s: number) => void;
}

const themes: { id: CanvasTheme; bg: string; border: string }[] = [
  { id: 'light',    bg: '#f5f5f7', border: '#d4d4d8' },
  { id: 'dark',     bg: '#1e1e2e', border: '#3f3f50' },
  { id: 'sepia',    bg: '#f0e6d3', border: '#c4a882' },
  { id: 'midnight', bg: '#0f172a', border: '#334155' },
  { id: 'sage',     bg: '#e8ede5', border: '#a3b899' },
  { id: 'rose',     bg: '#f5e6e8', border: '#d4a0a7' },
  { id: 'ocean',    bg: '#e0edf4', border: '#8bb8d0' },
  { id: 'slate',    bg: '#e2e4e9', border: '#9ca3af' },
];

const patterns: { id: CanvasPattern; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'grid', label: 'Grid' },
  { id: 'dots', label: 'Dots' },
  { id: 'lines', label: 'Lines' },
  { id: 'iso', label: 'Iso' },
  { id: 'cross', label: 'Cross' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'hex', label: 'Hex' },
];

export default function CanvasSettingsPanel({
  canvasTheme, pattern, patternSpacing, onThemeChange, onPatternChange, onPatternSpacingChange,
}: CanvasSettingsPanelProps) {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button className="p-2 rounded-lg bg-toolbar border border-toolbar-border text-toolbar-foreground hover:bg-toolbar-hover transition-all toolbar-shadow">
              <Settings2 size={18} />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Canvas Settings</TooltipContent>
      </Tooltip>

      <PopoverContent align="end" className="w-56 p-4 space-y-4">
        {/* Theme swatches */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Theme</p>
          <div className="grid grid-cols-4 gap-2">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => onThemeChange(t.id)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  canvasTheme === t.id
                    ? 'border-primary ring-2 ring-primary/20 scale-105'
                    : 'border-border hover:border-muted-foreground/40'
                }`}
                style={{ backgroundColor: t.bg }}
                aria-label={`${t.id} theme`}
              />
            ))}
          </div>
        </div>

        {/* Pattern chips */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Pattern</p>
          <div className="flex flex-wrap gap-1.5">
            {patterns.map(p => (
              <button
                key={p.id}
                onClick={() => onPatternChange(p.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                  pattern === p.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-secondary-foreground border-border hover:bg-muted'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern spacing slider */}
        {pattern !== 'none' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Density</p>
              <span className="text-xs text-muted-foreground tabular-nums">{patternSpacing}px</span>
            </div>
            <Slider
              min={15}
              max={80}
              step={1}
              value={[patternSpacing]}
              onValueChange={([v]) => onPatternSpacingChange(v)}
              className="w-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">Dense</span>
              <span className="text-[10px] text-muted-foreground">Sparse</span>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
