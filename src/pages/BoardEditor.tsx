import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WhiteboardCanvas from '@/components/canvas/WhiteboardCanvas';
import Toolbar from '@/components/canvas/Toolbar';
import MiniMap from '@/components/canvas/MiniMap';
import { TextInput, StickyInput } from '@/components/canvas/TextOverlay';
import { useCanvas } from '@/hooks/useCanvas';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { getBoard, saveBoard, updateBoardThumbnail } from '@/lib/boardStorage';
import { exportAsPNG, exportAsPDF, generateThumbnail } from '@/lib/exportUtils';
import type { Point, TextElement, StickyNote } from '@/types/canvas';
import { ArrowLeft, Download, Save } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const BoardEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    elements, setElements, camera, setCamera,
    activeTool, setActiveTool,
    color, setColor, brushSize, setBrushSize,
    addElement, eraseAt, undo, redo,
    screenToCanvas, zoom, pan, resetZoom,
    canUndo, canRedo,
  } = useCanvas();

  const [textInputPos, setTextInputPos] = useState<Point | null>(null);
  const [stickyInputPos, setStickyInputPos] = useState<Point | null>(null);
  const [boardName, setBoardName] = useState('Untitled');
  const [loaded, setLoaded] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load board
  useEffect(() => {
    if (!id) return;
    const board = getBoard(id);
    if (board) {
      setElements(board.elements);
      setCamera(board.camera);
      setBoardName(board.meta.name);
    }
    setLoaded(true);
  }, [id]);

  // Auto-save with debounce
  useEffect(() => {
    if (!loaded || !id) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const board = getBoard(id);
      if (board) {
        board.elements = elements;
        board.camera = camera;
        const thumb = generateThumbnail(elements);
        if (thumb) board.meta.thumbnail = thumb;
        saveBoard(board);
      }
    }, 1000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [elements, camera, loaded, id]);

  useKeyboardShortcuts({
    onToolChange: setActiveTool,
    onUndo: undo,
    onRedo: redo,
  });

  const handleZoomIn = useCallback(() => zoom(-1, window.innerWidth / 2, window.innerHeight / 2), [zoom]);
  const handleZoomOut = useCallback(() => zoom(1, window.innerWidth / 2, window.innerHeight / 2), [zoom]);
  const handleTextAdd = useCallback((pos: Point) => setTextInputPos(pos), []);
  const handleStickyAdd = useCallback((pos: Point) => setStickyInputPos(pos), []);

  const handleTextSubmit = useCallback((el: TextElement) => {
    addElement(el);
    setTextInputPos(null);
  }, [addElement]);

  const handleStickySubmit = useCallback((el: StickyNote) => {
    addElement(el);
    setStickyInputPos(null);
  }, [addElement]);

  const handleManualSave = () => {
    if (!id) return;
    const board = getBoard(id);
    if (board) {
      board.elements = elements;
      board.camera = camera;
      const thumb = generateThumbnail(elements);
      if (thumb) board.meta.thumbnail = thumb;
      saveBoard(board);
      toast.success('Board saved');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-canvas">
      {/* Top-left: back button + board name */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg bg-toolbar border border-toolbar-border text-toolbar-foreground hover:bg-toolbar-hover transition-all toolbar-shadow"
            >
              <ArrowLeft size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Back to boards</TooltipContent>
        </Tooltip>
        <span className="text-sm font-medium text-foreground bg-toolbar/80 backdrop-blur px-3 py-1.5 rounded-lg border border-toolbar-border">
          {boardName}
        </span>
      </div>

      {/* Top-right: save + export */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1">
        <ThemeToggle className="bg-toolbar border border-toolbar-border text-toolbar-foreground hover:bg-toolbar-hover toolbar-shadow" />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleManualSave}
              className="p-2 rounded-lg bg-toolbar border border-toolbar-border text-toolbar-foreground hover:bg-toolbar-hover transition-all toolbar-shadow"
            >
              <Save size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Save</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-lg bg-toolbar border border-toolbar-border text-toolbar-foreground hover:bg-toolbar-hover transition-all toolbar-shadow">
              <Download size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportAsPNG(elements, boardName)}>
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportAsPDF(elements, boardName)}>
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Toolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        color={color}
        onColorChange={setColor}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        zoom={camera.zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={resetZoom}
      />

      <WhiteboardCanvas
        elements={elements}
        activeTool={activeTool}
        color={color}
        brushSize={brushSize}
        camera={camera}
        onAddElement={addElement}
        onEraseAt={eraseAt}
        onZoom={zoom}
        onPan={pan}
        screenToCanvas={screenToCanvas}
        onTextAdd={handleTextAdd}
        onStickyAdd={handleStickyAdd}
      />

      {textInputPos && (
        <TextInput
          position={textInputPos}
          camera={camera}
          onSubmit={handleTextSubmit}
          onCancel={() => setTextInputPos(null)}
          color={color}
        />
      )}

      {stickyInputPos && (
        <StickyInput
          position={stickyInputPos}
          camera={camera}
          onSubmit={handleStickySubmit}
          onCancel={() => setStickyInputPos(null)}
        />
      )}

      <MiniMap
        elements={elements}
        camera={camera}
        canvasWidth={window.innerWidth}
        canvasHeight={window.innerHeight}
      />
    </div>
  );
};

export default BoardEditor;
