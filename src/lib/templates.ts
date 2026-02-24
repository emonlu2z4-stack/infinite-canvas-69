import type { CanvasElement, ShapeElement, TextElement, StickyNote } from '@/types/canvas';

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  category: 'study' | 'planning' | 'creative';
  elements: CanvasElement[];
}

function makeText(
  x: number, y: number, content: string, fontSize: number,
  opts?: { bold?: boolean; color?: string; width?: number }
): TextElement {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    position: { x, y },
    content,
    fontSize,
    fontWeight: opts?.bold ? 'bold' : 'normal',
    fontStyle: 'normal',
    color: opts?.color ?? '#1a1a2e',
    width: opts?.width ?? content.length * fontSize * 0.6,
    height: fontSize * 1.5,
  };
}

function makeRect(
  x1: number, y1: number, x2: number, y2: number,
  color: string, size = 2, fill?: string
): ShapeElement {
  return {
    id: crypto.randomUUID(),
    type: 'rectangle',
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    color,
    size,
    fill,
  };
}

function makeLine(
  x1: number, y1: number, x2: number, y2: number,
  color: string, size = 2
): ShapeElement {
  return {
    id: crypto.randomUUID(),
    type: 'line',
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    color,
    size,
  };
}

function makeArrow(
  x1: number, y1: number, x2: number, y2: number,
  color: string, size = 2
): ShapeElement {
  return {
    id: crypto.randomUUID(),
    type: 'arrow',
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    color,
    size,
  };
}

function makeSticky(
  x: number, y: number, content: string, color: string,
  w = 160, h = 120
): StickyNote {
  return {
    id: crypto.randomUUID(),
    type: 'sticky',
    position: { x, y },
    content,
    color,
    width: w,
    height: h,
  };
}

// ── Mind Map ──
const mindMapElements: CanvasElement[] = [
  // Center
  makeRect(-100, -40, 100, 40, '#0f3460', 3, '#dbeafe'),
  makeText(-80, -12, 'Central Topic', 18, { bold: true, color: '#0f3460' }),
  // Branches
  makeLine(100, 0, 250, -120, '#2a9d8f', 2),
  makeLine(100, 0, 250, 0, '#e07c24', 2),
  makeLine(100, 0, 250, 120, '#e94560', 2),
  makeLine(-100, 0, -250, -120, '#533483', 2),
  makeLine(-100, 0, -250, 0, '#2b9348', 2),
  makeLine(-100, 0, -250, 120, '#457b9d', 2),
  // Sub-topics
  makeRect(250, -150, 410, -90, '#2a9d8f', 2, '#d1fae5'),
  makeText(265, -132, 'Branch 1', 14, { bold: true, color: '#2a9d8f' }),
  makeRect(250, -30, 410, 30, '#e07c24', 2, '#fef3c7'),
  makeText(265, -12, 'Branch 2', 14, { bold: true, color: '#e07c24' }),
  makeRect(250, 90, 410, 150, '#e94560', 2, '#fce7f3'),
  makeText(265, 108, 'Branch 3', 14, { bold: true, color: '#e94560' }),
  makeRect(-410, -150, -250, -90, '#533483', 2, '#ede9fe'),
  makeText(-395, -132, 'Branch 4', 14, { bold: true, color: '#533483' }),
  makeRect(-410, -30, -250, 30, '#2b9348', 2, '#d1fae5'),
  makeText(-395, -12, 'Branch 5', 14, { bold: true, color: '#2b9348' }),
  makeRect(-410, 90, -250, 150, '#457b9d', 2, '#dbeafe'),
  makeText(-395, 108, 'Branch 6', 14, { bold: true, color: '#457b9d' }),
];

// ── Flowchart ──
const flowchartElements: CanvasElement[] = [
  // Start
  makeRect(-80, -300, 80, -250, '#2b9348', 3, '#d1fae5'),
  makeText(-30, -287, 'Start', 16, { bold: true, color: '#2b9348' }),
  makeArrow(0, -250, 0, -200, '#6c757d', 2),
  // Process 1
  makeRect(-100, -200, 100, -140, '#0f3460', 2, '#dbeafe'),
  makeText(-55, -180, 'Process 1', 14, { color: '#0f3460' }),
  makeArrow(0, -140, 0, -90, '#6c757d', 2),
  // Decision
  makeRect(-110, -90, 110, -20, '#e07c24', 2, '#fef3c7'),
  makeText(-48, -66, 'Decision?', 14, { bold: true, color: '#e07c24' }),
  // Yes path
  makeArrow(0, -20, 0, 40, '#2b9348', 2),
  makeText(8, 0, 'Yes', 12, { color: '#2b9348' }),
  makeRect(-100, 40, 100, 100, '#0f3460', 2, '#dbeafe'),
  makeText(-55, 60, 'Process 2', 14, { color: '#0f3460' }),
  makeArrow(0, 100, 0, 160, '#6c757d', 2),
  // End
  makeRect(-80, 160, 80, 210, '#e94560', 3, '#fce7f3'),
  makeText(-22, 175, 'End', 16, { bold: true, color: '#e94560' }),
  // No path
  makeArrow(110, -55, 250, -55, '#e94560', 2),
  makeText(160, -75, 'No', 12, { color: '#e94560' }),
  makeRect(250, -90, 450, -20, '#0f3460', 2, '#dbeafe'),
  makeText(295, -66, 'Alt Process', 14, { color: '#0f3460' }),
  makeLine(350, -20, 350, 185, '#6c757d', 1),
  makeLine(350, 185, 80, 185, '#6c757d', 1),
];

// ── Cornell Notes ──
const cornellElements: CanvasElement[] = [
  // Title area
  makeRect(-400, -320, 400, -270, '#0f3460', 2, '#dbeafe'),
  makeText(-380, -305, 'Cornell Notes — Subject / Date', 18, { bold: true, color: '#0f3460' }),
  // Cue column
  makeRect(-400, -270, -100, 200, '#533483', 1),
  makeText(-380, -255, 'Cue / Questions', 14, { bold: true, color: '#533483' }),
  makeText(-380, -220, 'Key term?', 12, { color: '#6c757d' }),
  makeText(-380, -190, 'Main idea?', 12, { color: '#6c757d' }),
  makeText(-380, -160, 'Why important?', 12, { color: '#6c757d' }),
  // Note-taking area
  makeRect(-100, -270, 400, 200, '#1a1a2e', 1),
  makeText(-80, -255, 'Notes', 14, { bold: true, color: '#1a1a2e' }),
  makeText(-80, -220, '• Write detailed notes here...', 12, { color: '#6c757d', width: 440 }),
  makeText(-80, -190, '• Capture key facts and concepts', 12, { color: '#6c757d', width: 440 }),
  makeText(-80, -160, '• Use abbreviations and symbols', 12, { color: '#6c757d', width: 440 }),
  // Summary area
  makeRect(-400, 200, 400, 320, '#2a9d8f', 2, '#d1fae5'),
  makeText(-380, 215, 'Summary', 14, { bold: true, color: '#2a9d8f' }),
  makeText(-380, 245, 'Write a brief summary of the notes above...', 12, { color: '#6c757d', width: 740 }),
  // Dividing lines
  makeLine(-100, -270, -100, 200, '#adb5bd', 2),
  makeLine(-400, 200, 400, 200, '#adb5bd', 2),
];

// ── KWL Chart ──
const kwlElements: CanvasElement[] = [
  makeText(-250, -200, 'KWL Chart', 22, { bold: true, color: '#0f3460' }),
  // K column
  makeRect(-350, -160, -50, 200, '#2b9348', 2, '#d1fae5'),
  makeText(-320, -145, 'K — What I Know', 14, { bold: true, color: '#2b9348' }),
  makeSticky(-320, -100, 'Prior knowledge...', '#d1fae5', 240, 80),
  // W column
  makeRect(-40, -160, 260, 200, '#e07c24', 2, '#fef3c7'),
  makeText(-10, -145, 'W — Want to Learn', 14, { bold: true, color: '#e07c24' }),
  makeSticky(-10, -100, 'Questions...', '#fef3c7', 240, 80),
  // L column
  makeRect(270, -160, 570, 200, '#0f3460', 2, '#dbeafe'),
  makeText(300, -145, 'L — What I Learned', 14, { bold: true, color: '#0f3460' }),
  makeSticky(300, -100, 'Key takeaways...', '#dbeafe', 240, 80),
];

// ── Kanban Board ──
const kanbanElements: CanvasElement[] = [
  makeText(-350, -220, 'Kanban Board', 22, { bold: true, color: '#0f3460' }),
  // To Do
  makeRect(-380, -180, -100, 280, '#e94560', 2),
  makeText(-360, -165, '📋 To Do', 16, { bold: true, color: '#e94560' }),
  makeLine(-380, -140, -100, -140, '#e94560', 1),
  makeSticky(-360, -120, 'Task 1', '#fce7f3', 240, 80),
  makeSticky(-360, -20, 'Task 2', '#fce7f3', 240, 80),
  // In Progress
  makeRect(-80, -180, 200, 280, '#e07c24', 2),
  makeText(-60, -165, '🔨 In Progress', 16, { bold: true, color: '#e07c24' }),
  makeLine(-80, -140, 200, -140, '#e07c24', 1),
  makeSticky(-60, -120, 'Task 3', '#fef3c7', 240, 80),
  // Done
  makeRect(220, -180, 500, 280, '#2b9348', 2),
  makeText(240, -165, '✅ Done', 16, { bold: true, color: '#2b9348' }),
  makeLine(220, -140, 500, -140, '#2b9348', 1),
  makeSticky(240, -120, 'Task 4', '#d1fae5', 240, 80),
];

// ── SWOT Analysis ──
const swotElements: CanvasElement[] = [
  makeText(-200, -260, 'SWOT Analysis', 22, { bold: true, color: '#0f3460' }),
  // Strengths
  makeRect(-300, -220, -10, 0, '#2b9348', 2, '#d1fae5'),
  makeText(-280, -205, '💪 Strengths', 15, { bold: true, color: '#2b9348' }),
  makeText(-280, -170, '• Internal positive', 12, { color: '#6c757d' }),
  // Weaknesses
  makeRect(10, -220, 300, 0, '#e94560', 2, '#fce7f3'),
  makeText(30, -205, '⚠️ Weaknesses', 15, { bold: true, color: '#e94560' }),
  makeText(30, -170, '• Internal negative', 12, { color: '#6c757d' }),
  // Opportunities
  makeRect(-300, 20, -10, 240, '#0f3460', 2, '#dbeafe'),
  makeText(-280, 35, '🚀 Opportunities', 15, { bold: true, color: '#0f3460' }),
  makeText(-280, 70, '• External positive', 12, { color: '#6c757d' }),
  // Threats
  makeRect(10, 20, 300, 240, '#e07c24', 2, '#fef3c7'),
  makeText(30, 35, '🔥 Threats', 15, { bold: true, color: '#e07c24' }),
  makeText(30, 70, '• External negative', 12, { color: '#6c757d' }),
];

export const TEMPLATES: BoardTemplate[] = [
  {
    id: 'mind-map',
    name: 'Mind Map',
    description: 'Organize ideas around a central topic with branching connections',
    icon: '🧠',
    category: 'study',
    elements: mindMapElements,
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    description: 'Visualize processes with decision points and steps',
    icon: '🔀',
    category: 'planning',
    elements: flowchartElements,
  },
  {
    id: 'cornell-notes',
    name: 'Cornell Notes',
    description: 'Structured note-taking with cues, notes, and summary sections',
    icon: '📝',
    category: 'study',
    elements: cornellElements,
  },
  {
    id: 'kwl-chart',
    name: 'KWL Chart',
    description: 'Track what you Know, Want to learn, and have Learned',
    icon: '📊',
    category: 'study',
    elements: kwlElements,
  },
  {
    id: 'kanban',
    name: 'Kanban Board',
    description: 'Manage tasks across To Do, In Progress, and Done columns',
    icon: '📋',
    category: 'planning',
    elements: kanbanElements,
  },
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Evaluate Strengths, Weaknesses, Opportunities, and Threats',
    icon: '📈',
    category: 'planning',
    elements: swotElements,
  },
];
