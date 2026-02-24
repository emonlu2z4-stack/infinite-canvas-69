import type { BoardState, BoardMeta, CanvasElement, Camera } from '@/types/canvas';
import type { BoardTemplate } from '@/lib/templates';

const BOARDS_KEY = 'eduboard_boards';
const BOARD_PREFIX = 'eduboard_board_';

export function listBoards(): BoardMeta[] {
  try {
    const raw = localStorage.getItem(BOARDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BoardMeta[];
  } catch {
    return [];
  }
}

function saveBoardList(boards: BoardMeta[]) {
  localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
}

export function getBoard(id: string): BoardState | null {
  try {
    const raw = localStorage.getItem(BOARD_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw) as BoardState;
  } catch {
    return null;
  }
}

export function saveBoard(board: BoardState) {
  board.meta.updatedAt = Date.now();
  localStorage.setItem(BOARD_PREFIX + board.meta.id, JSON.stringify(board));

  const boards = listBoards();
  const idx = boards.findIndex(b => b.id === board.meta.id);
  if (idx >= 0) {
    boards[idx] = board.meta;
  } else {
    boards.unshift(board.meta);
  }
  saveBoardList(boards);
}

export function createBoard(name: string): BoardState {
  const board: BoardState = {
    meta: {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    elements: [],
    camera: { x: 0, y: 0, zoom: 1 },
  };
  saveBoard(board);
  return board;
}

export function renameBoard(id: string, name: string) {
  const board = getBoard(id);
  if (!board) return;
  board.meta.name = name;
  saveBoard(board);
}

export function deleteBoard(id: string) {
  localStorage.removeItem(BOARD_PREFIX + id);
  const boards = listBoards().filter(b => b.id !== id);
  saveBoardList(boards);
}

export function updateBoardThumbnail(id: string, thumbnail: string) {
  const boards = listBoards();
  const idx = boards.findIndex(b => b.id === id);
  if (idx >= 0) {
    boards[idx].thumbnail = thumbnail;
    saveBoardList(boards);
  }
}

export function createBoardFromTemplate(template: BoardTemplate): BoardState {
  // Deep clone elements with fresh IDs
  const elements = JSON.parse(JSON.stringify(template.elements)) as CanvasElement[];
  elements.forEach(el => { el.id = crypto.randomUUID(); });
  const board: BoardState = {
    meta: {
      id: crypto.randomUUID(),
      name: template.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    elements,
    camera: { x: 0, y: 0, zoom: 1 },
  };
  saveBoard(board);
  return board;
}
