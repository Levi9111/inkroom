import React, { useState } from 'react';
import {
  MousePointer,
  Pen,
  Highlighter,
  Eraser,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  Sparkles,
  Undo2,
  Redo2,
  Palette,
} from 'lucide-react';
import { IconButton } from '@inkroom/ui';
import { useUIStore, type Tool } from '../stores/uiStore';
import { PropertiesPopover } from './PropertiesPopover';
import type { ShapeKind } from '@inkroom/shared';

export interface ToolDockProps {
  canDraw?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const ToolDock: React.FC<ToolDockProps> = ({
  canDraw = true,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const {
    activeTool,
    setTool,
    activeShapeKind,
    setShapeKind,
    strokeColor,
    strokeWidth,
  } = useUIStore();

  const [isPropertiesOpen, setPropertiesOpen] = useState(false);
  const [isShapesMenuOpen, setShapesMenuOpen] = useState(false);

  const shapes: { kind: ShapeKind; icon: React.ReactNode; label: string; key: string }[] = [
    { kind: 'rect', icon: <Square className="w-5 h-5" />, label: 'Rectangle', key: 'R' },
    { kind: 'ellipse', icon: <Circle className="w-5 h-5" />, label: 'Ellipse', key: 'O' },
    { kind: 'line', icon: <Minus className="w-5 h-5" />, label: 'Line', key: 'L' },
    { kind: 'arrow', icon: <ArrowRight className="w-5 h-5" />, label: 'Arrow', key: 'A' },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1 p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-xl shadow-xl shadow-slate-950/5 dark:shadow-black/40 transition-all duration-200">
      {/* Select Tool */}
      <IconButton
        label="Select"
        shortcut="V"
        isActive={activeTool === 'select'}
        onClick={() => setTool('select')}
      >
        <MousePointer className="w-5 h-5" />
      </IconButton>

      <div className="w-6 h-px bg-slate-200 dark:bg-slate-800 my-0.5" />

      {/* Pen */}
      <IconButton
        label="Pen"
        shortcut="P"
        disabled={!canDraw}
        isActive={activeTool === 'pen'}
        onClick={() => setTool('pen')}
      >
        <Pen className="w-5 h-5" />
      </IconButton>

      {/* Highlighter */}
      <IconButton
        label="Highlighter"
        shortcut="H"
        disabled={!canDraw}
        isActive={activeTool === 'highlighter'}
        onClick={() => setTool('highlighter')}
      >
        <Highlighter className="w-5 h-5" />
      </IconButton>

      {/* Eraser */}
      <IconButton
        label="Eraser"
        shortcut="E"
        disabled={!canDraw}
        isActive={activeTool === 'eraser'}
        onClick={() => setTool('eraser')}
      >
        <Eraser className="w-5 h-5" />
      </IconButton>

      {/* Shapes Dropdown / Flyout */}
      <div className="relative">
        <IconButton
          label={`Shape (${activeShapeKind})`}
          shortcut="R"
          disabled={!canDraw}
          isActive={activeTool === 'shape'}
          onClick={() => {
            setTool('shape');
            setShapesMenuOpen(!isShapesMenuOpen);
          }}
        >
          {activeShapeKind === 'ellipse' ? (
            <Circle className="w-5 h-5" />
          ) : activeShapeKind === 'line' ? (
            <Minus className="w-5 h-5" />
          ) : activeShapeKind === 'arrow' ? (
            <ArrowRight className="w-5 h-5" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </IconButton>

        {isShapesMenuOpen && (
          <div className="absolute left-14 top-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 flex flex-col gap-1 z-40">
            {shapes.map((s) => (
              <IconButton
                key={s.kind}
                label={s.label}
                shortcut={s.key}
                isActive={activeTool === 'shape' && activeShapeKind === s.kind}
                onClick={() => {
                  setShapeKind(s.kind);
                  setShapesMenuOpen(false);
                }}
              >
                {s.icon}
              </IconButton>
            ))}
          </div>
        )}
      </div>

      {/* Text Tool */}
      <IconButton
        label="Text"
        shortcut="T"
        disabled={!canDraw}
        isActive={activeTool === 'text'}
        onClick={() => setTool('text')}
      >
        <Type className="w-5 h-5" />
      </IconButton>

      {/* Laser Pointer */}
      <IconButton
        label="Laser Pointer"
        shortcut="X"
        isActive={activeTool === 'laser'}
        onClick={() => setTool('laser')}
      >
        <Sparkles className="w-5 h-5 text-red-500" />
      </IconButton>

      <div className="w-6 h-px bg-slate-200 dark:bg-slate-800 my-0.5" />

      {/* Properties Trigger (Color & Stroke Width) */}
      <div className="relative">
        <button
          onClick={() => setPropertiesOpen(!isPropertiesOpen)}
          aria-label="Color and Stroke Properties"
          className="w-11 h-11 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title="Color & stroke thickness"
        >
          <div
            className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center transition-transform hover:scale-110"
            style={{ backgroundColor: strokeColor }}
          >
            <div
              className="bg-white rounded-full"
              style={{
                width: Math.max(3, Math.min(10, strokeWidth)),
                height: Math.max(3, Math.min(10, strokeWidth)),
              }}
            />
          </div>
        </button>

        {isPropertiesOpen && (
          <PropertiesPopover onClose={() => setPropertiesOpen(false)} />
        )}
      </div>

      <div className="w-6 h-px bg-slate-200 dark:bg-slate-800 my-0.5" />

      {/* Scoped Undo / Redo */}
      <IconButton
        label="Undo"
        shortcut="Ctrl+Z"
        size="sm"
        disabled={!canUndo}
        onClick={onUndo}
      >
        <Undo2 className="w-4 h-4" />
      </IconButton>

      <IconButton
        label="Redo"
        shortcut="Ctrl+Y"
        size="sm"
        disabled={!canRedo}
        onClick={onRedo}
      >
        <Redo2 className="w-4 h-4" />
      </IconButton>
    </div>
  );
};
