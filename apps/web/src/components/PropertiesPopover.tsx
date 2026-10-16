import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { PROJECTOR_INK_COLORS, HIGHLIGHTER_COLORS, STROKE_WIDTH_PRESETS } from '@inkroom/shared';
import { Slider } from '@inkroom/ui';
import { useUIStore } from '../stores/uiStore';

export interface PropertiesPopoverProps {
  onClose: () => void;
}

const ERASER_SIZE_PRESETS = {
  S: 16,
  M: 32,
  L: 48,
  XL: 64,
} as const;

export const PropertiesPopover: React.FC<PropertiesPopoverProps> = ({ onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const {
    activeTool,
    strokeColor,
    setColor,
    strokeWidth,
    setStrokeWidth,
    highlighterColor,
    highlighterWidth,
    eraserWidth,
    setEraserWidth,
  } = useUIStore();

  const isEraser = activeTool === 'eraser';
  const isHighlighter = activeTool === 'highlighter';
  const isShape = activeTool === 'shape';
  const swatches = isHighlighter ? HIGHLIGHTER_COLORS : PROJECTOR_INK_COLORS;
  const currentColor = isHighlighter ? highlighterColor : strokeColor;
  const currentWidth = isEraser ? eraserWidth : isHighlighter ? highlighterWidth : strokeWidth;

  const handleWidthChange = (val: number) => {
    if (isEraser) {
      setEraserWidth(val);
    } else {
      setStrokeWidth(val);
    }
  };

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Use timeout to prevent immediate trigger by the opening click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="absolute left-16 bottom-0 w-68 max-h-[calc(100vh-5rem)] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-3.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          {isEraser
            ? 'Eraser'
            : isHighlighter
            ? 'Highlighter'
            : isShape
            ? 'Shape'
            : 'Pen'}{' '}
          Properties
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded p-0.5 transition-colors"
          aria-label="Close properties"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Color Swatches (Pen, Highlighter & Shape) */}
      {!isEraser && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            {isShape ? 'Shape Color' : isHighlighter ? 'Highlighter Tint' : 'Projector-Tuned Colors'}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {swatches.map((color) => {
              const isSelected = currentColor.toLowerCase() === color.hex.toLowerCase();
              return (
                <button
                  key={color.hex}
                  onClick={() => setColor(color.hex)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105 shadow-md'
                      : 'hover:scale-105 active:scale-95'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={`Select ${color.name}`}
                >
                  {isSelected && (
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        color.hex === '#FFFFFF' || color.hex === '#FACC15'
                          ? 'bg-black'
                          : 'bg-white'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Preset Widths */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          {isEraser ? 'Eraser Size' : 'Size Presets'}
        </label>
        <div className="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {(['S', 'M', 'L', 'XL'] as const).map((preset) => {
            const widthVal = isEraser ? ERASER_SIZE_PRESETS[preset] : STROKE_WIDTH_PRESETS[preset];
            const isSelected = currentWidth === widthVal;
            return (
              <button
                key={preset}
                onClick={() => handleWidthChange(widthVal)}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {preset}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider & Live Preview */}
      <div className="mb-1">
        <Slider
          label={isEraser ? 'Eraser Diameter' : 'Custom Thickness'}
          value={currentWidth}
          min={isEraser ? 8 : 1}
          max={isEraser ? 72 : 48}
          onChange={handleWidthChange}
        />
        <div className="mt-3 flex items-center justify-center h-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          {isEraser ? (
            <div
              className="rounded-full border-2 border-dashed border-indigo-500 bg-indigo-500/15 transition-all"
              style={{
                width: `${Math.min(36, currentWidth)}px`,
                height: `${Math.min(36, currentWidth)}px`,
              }}
            />
          ) : (
            <div
              className="rounded-full transition-all"
              style={{
                backgroundColor: currentColor,
                width: `${Math.min(28, currentWidth)}px`,
                height: `${Math.min(28, currentWidth)}px`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
