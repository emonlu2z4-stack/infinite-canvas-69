import React, { useState } from 'react';
import { TEMPLATES, type BoardTemplate } from '@/lib/templates';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: BoardTemplate) => void;
}

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'study', label: 'Study' },
  { key: 'planning', label: 'Planning' },
  { key: 'creative', label: 'Creative' },
] as const;

export default function TemplateDialog({ open, onOpenChange, onSelect }: TemplateDialogProps) {
  const [category, setCategory] = useState<string>('all');

  const filtered = category === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Start from a Template</DialogTitle>
        </DialogHeader>

        {/* Category filter */}
        <div className="flex gap-2 pb-2">
          {CATEGORIES.map(cat => (
            <Button
              key={cat.key}
              variant={category === cat.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(cat.key)}
              className="text-xs"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Template grid */}
        <div className="overflow-y-auto flex-1 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(template => (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {template.name}
                      </h3>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
