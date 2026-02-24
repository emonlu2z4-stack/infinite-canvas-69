export type Tool = 'select' | 'pen' | 'highlighter' | 'eraser' | 'rectangle' | 'circle' | 'arrow' | 'line' | 'text' | 'sticky';

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  type: 'pen' | 'highlighter' | 'eraser';
  points: Point[];
  color: string;
  size: number;
  opacity: number;
}

export interface ShapeElement {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow' | 'line';
  start: Point;
  end: Point;
  color: string;
  size: number;
  fill?: string;
}

export interface TextElement {
  id: string;
  type: 'text';
  position: Point;
  content: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  color: string;
  width: number;
  height: number;
}

export interface StickyNote {
  id: string;
  type: 'sticky';
  position: Point;
  content: string;
  color: string;
  width: number;
  height: number;
}

export type CanvasElement = Stroke | ShapeElement | TextElement | StickyNote;

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface BoardState {
  elements: CanvasElement[];
  camera: Camera;
}

export const COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#e94560',
  '#533483', '#2b9348', '#e07c24', '#d62828',
  '#457b9d', '#2a9d8f', '#e9c46a', '#f4a261',
  '#264653', '#6c757d', '#adb5bd', '#f8f9fa',
];

export const STICKY_COLORS = [
  '#fef3c7', '#fce7f3', '#dbeafe', '#d1fae5',
  '#fde68a', '#fbcfe8', '#bfdbfe', '#a7f3d0',
];
