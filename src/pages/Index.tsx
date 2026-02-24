import React, { useState, useCallback } from 'react';
import WhiteboardCanvas from '@/components/canvas/WhiteboardCanvas';
import Toolbar from '@/components/canvas/Toolbar';
import MiniMap from '@/components/canvas/MiniMap';
import { TextInput, StickyInput } from '@/components/canvas/TextOverlay';
import { useCanvas } from '@/hooks/useCanvas';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { Point, TextElement, StickyNote } from '@/types/canvas';

const Index = () => {
  const {
    elements, camera, activeTool, setActiveTool,
    color, setColor, brushSize, setBrushSize,
    addElement, eraseAt, undo, redo,
    screenToCanvas, zoom, pan, resetZoom,
    canUndo, canRedo,
  } = useCanvas();

  const [textInputPos, setTextInputPos] = useState<Point | null>(null);
  const [stickyInputPos, setStickyInputPos] = useState<Point | null>(null);

  useKeyboardShortcuts({
    onToolChange: setActiveTool,
    onUndo: undo,
    onRedo: redo,
  });

  const handleZoomIn = useCallback(() => {
    zoom(-1, window.innerWidth / 2, window.innerHeight / 2);
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    zoom(1, window.innerWidth / 2, window.innerHeight / 2);
  }, [zoom]);

  const handleTextAdd = useCallback((pos: Point) => {
    setTextInputPos(pos);
  }, []);

  const handleStickyAdd = useCallback((pos: Point) => {
    setStickyInputPos(pos);
  }, []);

  const handleTextSubmit = useCallback((el: TextElement) => {
    addElement(el);
    setTextInputPos(null);
  }, [addElement]);

  const handleStickySubmit = useCallback((el: StickyNote) => {
    addElement(el);
    setStickyInputPos(null);
  }, [addElement]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-canvas">
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

export default Index;
