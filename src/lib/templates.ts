import type { CanvasElement, ShapeElement, TextElement, StickyNote } from '@/types/canvas';

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'study' | 'planning' | 'creative';
  elements: CanvasElement[];
}

/* ─── Helpers ─── */

function makeText(
  x: number, y: number, content: string, fontSize: number,
  opts?: { bold?: boolean; italic?: boolean; color?: string; width?: number }
): TextElement {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    position: { x, y },
    content,
    fontSize,
    fontWeight: opts?.bold ? 'bold' : 'normal',
    fontStyle: opts?.italic ? 'italic' : 'normal',
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

function makeCircle(
  cx: number, cy: number, r: number,
  color: string, size = 2, fill?: string
): ShapeElement {
  return {
    id: crypto.randomUUID(),
    type: 'circle',
    start: { x: cx - r, y: cy - r },
    end: { x: cx + r, y: cy + r },
    color,
    size,
    fill,
  };
}

function ruledLines(
  x1: number, y1: number, x2: number, y2: number,
  spacing: number, color = '#d4d4d8', size = 1
): ShapeElement[] {
  const lines: ShapeElement[] = [];
  for (let y = y1 + spacing; y < y2; y += spacing) {
    lines.push(makeLine(x1, y, x2, y, color, size));
  }
  return lines;
}

/* ═══════════════════════════════════════════════════
   1. MIND MAP — Radial, color-coded, with sub-branches
   ═══════════════════════════════════════════════════ */

function buildMindMap(): CanvasElement[] {
  const els: CanvasElement[] = [];
  const palette = [
    { branch: '#2563eb', bg: '#dbeafe', label: 'Concept A' },
    { branch: '#059669', bg: '#d1fae5', label: 'Concept B' },
    { branch: '#d97706', bg: '#fef3c7', label: 'Concept C' },
    { branch: '#dc2626', bg: '#fee2e2', label: 'Concept D' },
    { branch: '#7c3aed', bg: '#ede9fe', label: 'Concept E' },
    { branch: '#0891b2', bg: '#cffafe', label: 'Concept F' },
  ];

  // Central node — rounded pill with bold title
  els.push(makeCircle(0, 0, 70, '#1e3a5f', 3, '#e0f2fe'));
  els.push(makeText(-52, -10, 'MAIN IDEA', 18, { bold: true, color: '#1e3a5f' }));

  // Title
  els.push(makeText(-120, -180, '🧠  Mind Map', 26, { bold: true, color: '#1e3a5f' }));
  els.push(makeText(-140, -150, 'Write your central topic and branch outward', 11, { italic: true, color: '#64748b' }));

  // Six radial branches at 60° intervals
  const angles = [-90, -30, 30, 90, 150, 210];
  const branchLen = 190;
  const subLen = 100;

  palette.forEach((p, i) => {
    const a = (angles[i] * Math.PI) / 180;
    const bx = Math.cos(a) * branchLen;
    const by = Math.sin(a) * branchLen;

    // Main branch line
    els.push(makeLine(Math.cos(a) * 70, Math.sin(a) * 70, bx, by, p.branch, 3));

    // Branch node
    els.push(makeRect(bx - 75, by - 24, bx + 75, by + 24, p.branch, 2, p.bg));
    els.push(makeText(bx - 55, by - 8, p.label, 13, { bold: true, color: p.branch }));

    // Two sub-branches per node
    const perpA = a + Math.PI / 6;
    const perpB = a - Math.PI / 6;
    const sx1 = bx + Math.cos(perpA) * subLen;
    const sy1 = by + Math.sin(perpA) * subLen;
    const sx2 = bx + Math.cos(perpB) * subLen;
    const sy2 = by + Math.sin(perpB) * subLen;

    els.push(makeLine(bx, by, sx1, sy1, p.branch, 1));
    els.push(makeRect(sx1 - 50, sy1 - 16, sx1 + 50, sy1 + 16, p.branch, 1, p.bg));
    els.push(makeText(sx1 - 35, sy1 - 6, 'Detail', 10, { color: p.branch }));

    els.push(makeLine(bx, by, sx2, sy2, p.branch, 1));
    els.push(makeRect(sx2 - 50, sy2 - 16, sx2 + 50, sy2 + 16, p.branch, 1, p.bg));
    els.push(makeText(sx2 - 35, sy2 - 6, 'Detail', 10, { color: p.branch }));
  });

  // Usage tip
  els.push(makeText(-200, 340, '💡 Tip: Click each branch to add sub-topics. Use color to group related ideas.', 10, { italic: true, color: '#94a3b8', width: 400 }));

  return els;
}

/* ═══════════════════════════════════════════════════
   2. FLOWCHART — Professional process diagram
   ═══════════════════════════════════════════════════ */

function buildFlowchart(): CanvasElement[] {
  const els: CanvasElement[] = [];
  const W = 180, H = 50;
  const gap = 30;
  const cx = 0;
  let y = -340;

  // Title
  els.push(makeText(-130, y, '🔀  Flowchart', 26, { bold: true, color: '#1e3a5f' }));
  y += 40;
  els.push(makeText(-170, y, 'Map out your process step by step', 11, { italic: true, color: '#64748b' }));
  y += 40;

  // Legend
  els.push(makeRect(260, -340, 460, -200, '#e2e8f0', 1, '#f8fafc'));
  els.push(makeText(275, -328, 'LEGEND', 12, { bold: true, color: '#475569' }));
  els.push(makeRect(275, -305, 305, -290, '#16a34a', 1, '#bbf7d0'));
  els.push(makeText(315, -303, 'Start / End', 10, { color: '#475569' }));
  els.push(makeRect(275, -280, 305, -265, '#2563eb', 1, '#dbeafe'));
  els.push(makeText(315, -278, 'Process', 10, { color: '#475569' }));
  els.push(makeRect(275, -255, 305, -240, '#d97706', 1, '#fef3c7'));
  els.push(makeText(315, -253, 'Decision', 10, { color: '#475569' }));
  els.push(makeRect(275, -230, 305, -215, '#7c3aed', 1, '#ede9fe'));
  els.push(makeText(315, -228, 'Input / Output', 10, { color: '#475569' }));

  // Start
  els.push(makeRect(cx - W / 2, y, cx + W / 2, y + H, '#16a34a', 3, '#bbf7d0'));
  els.push(makeText(cx - 22, y + 15, 'START', 15, { bold: true, color: '#16a34a' }));
  els.push(makeArrow(cx, y + H, cx, y + H + gap, '#94a3b8', 2));
  y += H + gap;

  // Input
  els.push(makeRect(cx - W / 2, y, cx + W / 2, y + H, '#7c3aed', 2, '#ede9fe'));
  els.push(makeText(cx - 50, y + 15, 'Input / Data', 13, { color: '#7c3aed' }));
  els.push(makeArrow(cx, y + H, cx, y + H + gap, '#94a3b8', 2));
  y += H + gap;

  // Process 1
  els.push(makeRect(cx - W / 2, y, cx + W / 2, y + H, '#2563eb', 2, '#dbeafe'));
  els.push(makeText(cx - 40, y + 15, 'Process 1', 13, { color: '#2563eb' }));
  els.push(makeArrow(cx, y + H, cx, y + H + gap, '#94a3b8', 2));
  y += H + gap;

  // Decision
  const decY = y;
  els.push(makeRect(cx - W / 2 - 10, decY, cx + W / 2 + 10, decY + H + 10, '#d97706', 2, '#fef3c7'));
  els.push(makeText(cx - 40, decY + 17, 'Decision?', 14, { bold: true, color: '#d97706' }));

  // Yes path (down)
  els.push(makeArrow(cx, decY + H + 10, cx, decY + H + 10 + gap, '#16a34a', 2));
  els.push(makeText(cx + 8, decY + H + 12, 'Yes', 11, { bold: true, color: '#16a34a' }));
  const yesY = decY + H + 10 + gap;
  els.push(makeRect(cx - W / 2, yesY, cx + W / 2, yesY + H, '#2563eb', 2, '#dbeafe'));
  els.push(makeText(cx - 40, yesY + 15, 'Process 2', 13, { color: '#2563eb' }));
  els.push(makeArrow(cx, yesY + H, cx, yesY + H + gap, '#94a3b8', 2));
  const endY = yesY + H + gap;
  els.push(makeRect(cx - W / 2, endY, cx + W / 2, endY + H, '#16a34a', 3, '#bbf7d0'));
  els.push(makeText(cx - 18, endY + 15, 'END', 15, { bold: true, color: '#16a34a' }));

  // No path (right)
  const altX = cx + W / 2 + 10 + 40;
  els.push(makeArrow(cx + W / 2 + 10, decY + (H + 10) / 2, altX, decY + (H + 10) / 2, '#dc2626', 2));
  els.push(makeText(cx + W / 2 + 15, decY + 15, 'No', 11, { bold: true, color: '#dc2626' }));
  els.push(makeRect(altX, decY, altX + W, decY + H + 10, '#2563eb', 2, '#dbeafe'));
  els.push(makeText(altX + 25, decY + 17, 'Alt Process', 13, { color: '#2563eb' }));
  // Loop back arrow
  els.push(makeLine(altX + W / 2, decY + H + 10, altX + W / 2, endY + H / 2, '#94a3b8', 1));
  els.push(makeLine(altX + W / 2, endY + H / 2, cx + W / 2, endY + H / 2, '#94a3b8', 1));

  // Tip
  els.push(makeText(-200, endY + 80, '💡 Tip: Add sticky notes beside steps for additional context. Color-code paths for clarity.', 10, { italic: true, color: '#94a3b8', width: 420 }));

  return els;
}

/* ═══════════════════════════════════════════════════
   3. CORNELL NOTES — Traditional ruled layout
   ═══════════════════════════════════════════════════ */

function buildCornellNotes(): CanvasElement[] {
  const els: CanvasElement[] = [];

  const pL = -380, pR = 400;
  const pT = -360, pB = 420;
  const cueDiv = -120; // vertical divider x
  const headerH = 50;
  const summaryH = 120;
  const headerBot = pT + headerH;
  const summaryTop = pB - summaryH;
  const lineSpacing = 26;
  const ruleColor = '#cbd5e1';
  const borderColor = '#334155';
  const accentBlue = '#2563eb';

  // ── Title ──
  els.push(makeText(pL, pT - 45, '📝  Cornell Notes', 26, { bold: true, color: '#1e3a5f' }));
  els.push(makeText(pL, pT - 18, 'Cues on the left, detailed notes on the right, summary at the bottom', 11, { italic: true, color: '#64748b', width: 500 }));

  // ── Outer border ──
  els.push(makeRect(pL, pT, pR, pB, borderColor, 2));

  // ── Header row (TOPIC | DATE) ──
  els.push(makeLine(pL, headerBot, pR, headerBot, borderColor, 2));
  els.push(makeText(pL + 16, pT + 8, 'TOPIC:', 14, { bold: true, color: accentBlue }));
  els.push(makeLine(pL + 90, pT + 8, pR - 160, pT + 8 + 22, ruleColor, 1)); // underline for writing
  const dateX = pR - 150;
  els.push(makeLine(dateX, pT, dateX, headerBot, borderColor, 1));
  els.push(makeText(dateX + 12, pT + 8, 'DATE:', 14, { bold: true, color: accentBlue }));
  els.push(makeLine(dateX + 70, pT + 8, pR - 12, pT + 8 + 22, ruleColor, 1));

  // Subject line
  els.push(makeText(pL + 16, pT + 30, 'CLASS / SUBJECT:', 10, { color: '#64748b' }));
  els.push(makeLine(pL + 140, pT + 30, dateX - 10, pT + 30 + 16, ruleColor, 1));

  // ── Vertical divider ──
  els.push(makeLine(cueDiv, headerBot, cueDiv, summaryTop, accentBlue, 2));

  // ── Summary divider ──
  els.push(makeLine(pL, summaryTop, pR, summaryTop, borderColor, 2));

  // ── Column labels ──
  els.push(makeText(pL + 16, headerBot + 8, 'CUES / QUESTIONS', 12, { bold: true, color: accentBlue, width: 140 }));
  els.push(makeText(cueDiv + 16, headerBot + 8, 'NOTES', 12, { bold: true, color: accentBlue }));

  // Small instruction text
  els.push(makeText(pL + 16, headerBot + 28, 'Write key words,', 9, { italic: true, color: '#94a3b8', width: 120 }));
  els.push(makeText(pL + 16, headerBot + 40, 'questions, diagrams', 9, { italic: true, color: '#94a3b8', width: 120 }));
  els.push(makeText(cueDiv + 16, headerBot + 28, 'Record lecture notes, ideas, and facts here', 9, { italic: true, color: '#94a3b8', width: 350 }));

  // ── Ruled lines — Cues column ──
  const bodyTop = headerBot + 58;
  els.push(...ruledLines(pL + 10, bodyTop, cueDiv - 10, summaryTop, lineSpacing, ruleColor));

  // ── Ruled lines — Notes column ──
  els.push(...ruledLines(cueDiv + 10, bodyTop, pR - 10, summaryTop, lineSpacing, ruleColor));

  // ── Red margin line in notes (like real notebook) ──
  els.push(makeLine(cueDiv + 50, headerBot, cueDiv + 50, summaryTop, '#fca5a5', 1));

  // ── Summary section ──
  els.push(makeText(pL + 16, summaryTop + 10, 'SUMMARY', 14, { bold: true, color: accentBlue }));
  els.push(makeText(pL + 100, summaryTop + 12, '(Synthesize key points in your own words)', 9, { italic: true, color: '#94a3b8', width: 300 }));
  els.push(...ruledLines(pL + 10, summaryTop + 32, pR - 10, pB - 5, lineSpacing, ruleColor));

  // ── Checklist reminder ──
  els.push(makeText(pL, pB + 15, '☑ Review cues within 24 hours   ☑ Write summary same day   ☑ Use for self-testing before exams', 10, { color: '#94a3b8', width: 600 }));

  return els;
}

/* ═══════════════════════════════════════════════════
   4. KWL CHART — Three-column learning tracker
   ═══════════════════════════════════════════════════ */

function buildKWL(): CanvasElement[] {
  const els: CanvasElement[] = [];
  const colW = 260, colH = 440, gap = 12;
  const topY = -200;
  const lineSpacing = 28;

  const cols = [
    { label: 'K — What I KNOW', color: '#16a34a', bg: '#f0fdf4', hint: 'List prior knowledge, facts, and assumptions' },
    { label: 'W — What I WANT to Know', color: '#d97706', bg: '#fffbeb', hint: 'Write questions and learning goals' },
    { label: 'L — What I LEARNED', color: '#2563eb', bg: '#eff6ff', hint: 'Record key takeaways after studying' },
  ];

  // Title
  els.push(makeText(-colW * 1.5 - gap, topY - 70, '📊  KWL Chart', 26, { bold: true, color: '#1e3a5f' }));
  els.push(makeText(-colW * 1.5 - gap, topY - 40, 'Track your learning journey: before, during, and after', 11, { italic: true, color: '#64748b', width: 400 }));

  // Topic field
  els.push(makeText(-colW * 1.5 - gap, topY - 16, 'TOPIC:', 13, { bold: true, color: '#1e3a5f' }));
  els.push(makeLine(-colW * 1.5 - gap + 70, topY - 16, colW * 1.5 + gap, topY - 16 + 18, '#cbd5e1', 1));

  cols.forEach((c, i) => {
    const x = -colW * 1.5 - gap + i * (colW + gap);
    const y = topY;

    // Column background
    els.push(makeRect(x, y, x + colW, y + colH, c.color, 2, c.bg));

    // Header band
    els.push(makeRect(x, y, x + colW, y + 40, c.color, 0, c.color + '20'));
    els.push(makeText(x + 14, y + 10, c.label, 13, { bold: true, color: c.color, width: colW - 28 }));

    // Hint
    els.push(makeText(x + 14, y + 46, c.hint, 9, { italic: true, color: '#94a3b8', width: colW - 28 }));

    // Ruled lines
    els.push(...ruledLines(x + 10, y + 64, x + colW - 10, y + colH - 10, lineSpacing, '#e2e8f0'));

    // Bullet starters
    for (let row = 0; row < 3; row++) {
      els.push(makeText(x + 14, y + 70 + row * lineSpacing, '•', 11, { color: c.color }));
    }
  });

  // Reflection box at bottom
  const refY = topY + colH + 20;
  const totalW = colW * 3 + gap * 2;
  els.push(makeRect(-colW * 1.5 - gap, refY, -colW * 1.5 - gap + totalW, refY + 80, '#1e3a5f', 2, '#f1f5f9'));
  els.push(makeText(-colW * 1.5 - gap + 14, refY + 8, '🔍 REFLECTION', 13, { bold: true, color: '#1e3a5f' }));
  els.push(makeText(-colW * 1.5 - gap + 14, refY + 30, 'What surprised me? What do I still need to learn? How will I apply this?', 10, { italic: true, color: '#64748b', width: totalW - 28 }));
  els.push(...ruledLines(-colW * 1.5 - gap + 10, refY + 46, -colW * 1.5 - gap + totalW - 10, refY + 75, 26, '#cbd5e1'));

  return els;
}

/* ═══════════════════════════════════════════════════
   5. KANBAN BOARD — Three swim lanes with cards
   ═══════════════════════════════════════════════════ */

function buildKanban(): CanvasElement[] {
  const els: CanvasElement[] = [];
  const colW = 270, colH = 500, gap = 16;
  const topY = -220;

  const lanes = [
    { label: '📋  TO DO', color: '#dc2626', bg: '#fef2f2', headerBg: '#fecaca' },
    { label: '🔨  IN PROGRESS', color: '#d97706', bg: '#fffbeb', headerBg: '#fde68a' },
    { label: '✅  DONE', color: '#16a34a', bg: '#f0fdf4', headerBg: '#bbf7d0' },
  ];

  // Title
  els.push(makeText(-colW * 1.5 - gap, topY - 65, '📋  Kanban Board', 26, { bold: true, color: '#1e3a5f' }));
  els.push(makeText(-colW * 1.5 - gap, topY - 38, 'Drag sticky notes between columns to track progress', 11, { italic: true, color: '#64748b', width: 400 }));

  // Sprint / project label
  els.push(makeText(-colW * 1.5 - gap, topY - 14, 'PROJECT:', 12, { bold: true, color: '#1e3a5f' }));
  els.push(makeLine(-colW * 1.5 - gap + 80, topY - 14, colW * 1.5 + gap, topY - 14 + 16, '#cbd5e1', 1));

  lanes.forEach((lane, i) => {
    const x = -colW * 1.5 - gap + i * (colW + gap);
    const y = topY;

    // Column bg
    els.push(makeRect(x, y, x + colW, y + colH, lane.color, 2, lane.bg));

    // Header band
    els.push(makeRect(x, y, x + colW, y + 44, lane.color, 0, lane.headerBg));
    els.push(makeText(x + 14, y + 12, lane.label, 15, { bold: true, color: lane.color }));

    // Count badge placeholder
    els.push(makeCircle(x + colW - 24, y + 22, 12, lane.color, 1, lane.headerBg));
    els.push(makeText(x + colW - 30, y + 16, '0', 11, { bold: true, color: lane.color }));

    // Sample task cards
    const taskColors = [lane.bg, '#ffffff'];
    for (let t = 0; t < 3; t++) {
      const ty = y + 60 + t * 110;
      const cardFill = taskColors[t % 2];
      els.push(makeRect(x + 12, ty, x + colW - 12, ty + 95, '#e2e8f0', 1, cardFill));
      // Priority dot
      els.push(makeCircle(x + 26, ty + 14, 5, lane.color, 0, lane.color));
      els.push(makeText(x + 38, ty + 8, `Task ${i * 3 + t + 1}`, 12, { bold: true, color: '#1e293b' }));
      els.push(makeText(x + 24, ty + 30, 'Description goes here...', 10, { color: '#64748b', width: colW - 48 }));
      // Checkbox
      els.push(makeRect(x + 24, ty + 55, x + 38, ty + 69, '#94a3b8', 1));
      els.push(makeText(x + 44, ty + 55, 'Subtask 1', 10, { color: '#475569' }));
      els.push(makeRect(x + 24, ty + 73, x + 38, ty + 87, '#94a3b8', 1));
      els.push(makeText(x + 44, ty + 73, 'Subtask 2', 10, { color: '#475569' }));
    }
  });

  // WIP limit reminder
  const tipY = topY + colH + 15;
  els.push(makeText(-colW * 1.5 - gap, tipY, '💡 Tip: Limit "In Progress" to 3 items max (WIP limit). Move cards left-to-right as work advances.', 10, { italic: true, color: '#94a3b8', width: 600 }));

  return els;
}

/* ═══════════════════════════════════════════════════
   6. SWOT ANALYSIS — 2×2 color-coded quadrants
   ═══════════════════════════════════════════════════ */

function buildSWOT(): CanvasElement[] {
  const els: CanvasElement[] = [];
  const qW = 300, qH = 260, gap = 8;
  const cx = 0, cy = 40;

  const quads = [
    { label: '💪 STRENGTHS', sub: 'Internal · Positive', color: '#16a34a', bg: '#f0fdf4', headerBg: '#bbf7d0', dx: -1, dy: -1,
      hints: ['What do we do well?', 'Key advantages?', 'Unique resources?'] },
    { label: '⚠️ WEAKNESSES', sub: 'Internal · Negative', color: '#dc2626', bg: '#fef2f2', headerBg: '#fecaca', dx: 1, dy: -1,
      hints: ['Where can we improve?', 'Skill gaps?', 'Resource limitations?'] },
    { label: '🚀 OPPORTUNITIES', sub: 'External · Positive', color: '#2563eb', bg: '#eff6ff', headerBg: '#bfdbfe', dx: -1, dy: 1,
      hints: ['Emerging trends?', 'New markets?', 'Partnerships?'] },
    { label: '🔥 THREATS', sub: 'External · Negative', color: '#d97706', bg: '#fffbeb', headerBg: '#fde68a', dx: 1, dy: 1,
      hints: ['Competition?', 'Regulatory changes?', 'Economic risks?'] },
  ];

  // Title
  els.push(makeText(cx - qW - gap, cy - qH - gap - 70, '📈  SWOT Analysis', 26, { bold: true, color: '#1e3a5f' }));
  els.push(makeText(cx - qW - gap, cy - qH - gap - 42, 'Evaluate internal strengths & weaknesses, external opportunities & threats', 11, { italic: true, color: '#64748b', width: 500 }));

  // Subject field
  els.push(makeText(cx - qW - gap, cy - qH - gap - 18, 'SUBJECT:', 12, { bold: true, color: '#1e3a5f' }));
  els.push(makeLine(cx - qW - gap + 80, cy - qH - gap - 18, cx + qW + gap, cy - qH - gap - 18 + 16, '#cbd5e1', 1));

  // Axis labels
  els.push(makeText(cx - 45, cy - qH - gap - 2, 'INTERNAL', 10, { bold: true, color: '#475569' }));
  els.push(makeText(cx - 45, cy + qH + gap - 6, 'EXTERNAL', 10, { bold: true, color: '#475569' }));
  els.push(makeText(cx - qW - gap - 5, cy - 6, 'P', 10, { bold: true, color: '#16a34a' }));
  els.push(makeText(cx - qW - gap - 5, cy + 6, 'O', 10, { bold: true, color: '#16a34a' }));
  els.push(makeText(cx - qW - gap - 5, cy + 18, 'S', 10, { bold: true, color: '#16a34a' }));
  els.push(makeText(cx + qW + gap + 4, cy - 6, 'N', 10, { bold: true, color: '#dc2626' }));
  els.push(makeText(cx + qW + gap + 4, cy + 6, 'E', 10, { bold: true, color: '#dc2626' }));
  els.push(makeText(cx + qW + gap + 4, cy + 18, 'G', 10, { bold: true, color: '#dc2626' }));

  quads.forEach(q => {
    const x = cx + (q.dx < 0 ? -qW - gap : gap);
    const y = cy + (q.dy < 0 ? -qH - gap : gap);

    // Quadrant box
    els.push(makeRect(x, y, x + qW, y + qH, q.color, 2, q.bg));

    // Header band
    els.push(makeRect(x, y, x + qW, y + 44, q.color, 0, q.headerBg));
    els.push(makeText(x + 14, y + 6, q.label, 14, { bold: true, color: q.color }));
    els.push(makeText(x + 14, y + 26, q.sub, 9, { italic: true, color: q.color + 'bb' }));

    // Guided prompts
    q.hints.forEach((h, hi) => {
      const hy = y + 56 + hi * 28;
      els.push(makeText(x + 18, hy, '•', 12, { color: q.color }));
      els.push(makeText(x + 30, hy, h, 11, { italic: true, color: '#94a3b8', width: qW - 44 }));
    });

    // Ruled lines for writing
    els.push(...ruledLines(x + 14, y + 140, x + qW - 14, y + qH - 10, 26, '#e2e8f0'));
  });

  // Action items box at bottom
  const actY = cy + qH + gap + 20;
  const totalW = qW * 2 + gap * 2;
  els.push(makeRect(cx - qW - gap, actY, cx + qW + gap, actY + 90, '#1e3a5f', 2, '#f1f5f9'));
  els.push(makeText(cx - qW - gap + 14, actY + 8, '🎯 ACTION ITEMS', 13, { bold: true, color: '#1e3a5f' }));
  els.push(makeText(cx - qW - gap + 14, actY + 28, 'Based on your analysis, list 3-5 concrete next steps:', 10, { italic: true, color: '#64748b', width: totalW - 28 }));
  for (let i = 0; i < 3; i++) {
    const ay = actY + 48 + i * 14;
    els.push(makeRect(cx - qW - gap + 14, ay, cx - qW - gap + 28, ay + 12, '#94a3b8', 1));
    els.push(makeLine(cx - qW - gap + 36, ay + 10, cx + qW + gap - 14, ay + 10, '#e2e8f0', 1));
  }

  return els;
}

/* ═══════════════════════════════════════════════════
   TEMPLATE REGISTRY
   ═══════════════════════════════════════════════════ */

export const TEMPLATES: BoardTemplate[] = [
  {
    id: 'mind-map',
    name: 'Mind Map',
    description: 'Radial brainstorming with color-coded branches and sub-topics for visual thinking',
    icon: '🧠',
    category: 'creative',
    elements: buildMindMap(),
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    description: 'Professional process diagram with decision points, color-coded legend, and loop paths',
    icon: '🔀',
    category: 'planning',
    elements: buildFlowchart(),
  },
  {
    id: 'cornell-notes',
    name: 'Cornell Notes',
    description: 'Classic ruled note-taking layout with cues, notes, and summary — built for active recall',
    icon: '📝',
    category: 'study',
    elements: buildCornellNotes(),
  },
  {
    id: 'kwl-chart',
    name: 'KWL Chart',
    description: 'Three-column learning tracker: Know, Want to learn, Learned — with reflection section',
    icon: '📊',
    category: 'study',
    elements: buildKWL(),
  },
  {
    id: 'kanban',
    name: 'Kanban Board',
    description: 'Task management with swim lanes, priority dots, subtask checklists, and WIP limits',
    icon: '📋',
    category: 'planning',
    elements: buildKanban(),
  },
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Strategic 2×2 quadrant analysis with guided prompts and action-item checklist',
    icon: '📈',
    category: 'planning',
    elements: buildSWOT(),
  },
];
