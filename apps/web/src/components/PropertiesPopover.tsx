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
    eraserMode,
    setEraserMode,
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
      className="absolute left-16 bottom-0 w-[340px] max-w-[calc(100vw-5rem)] max-h-[calc(100vh-5rem)] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-5 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
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
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close properties"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Eraser Mode Selection */}
      {isEraser && (
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Eraser Mode
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setEraserMode('precision')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                eraserMode === 'precision'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Precision</span>
              <span className="text-[10px] font-normal opacity-75">Carve slice-by-slice</span>
            </button>
            <button
              onClick={() => setEraserMode('object')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                eraserMode === 'object'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Object</span>
              <span className="text-[10px] font-normal opacity-75">Delete whole stroke</span>
            </button>
          </div>
        </div>
      )}

      {/* Color Swatches (Pen, Highlighter & Shape) */}
      {!isEraser && (
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            {isShape ? 'Shape Color' : isHighlighter ? 'Highlighter Tint' : 'Projector-Tuned Colors'}
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {swatches.map((color) => {
              const isSelected = currentColor.toLowerCase() === color.hex.toLowerCase();
              return (
                <button
                  key={color.hex}
                  onClick={() => setColor(color.hex)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
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
                      className={`w-3 h-3 rounded-full shadow-sm ${
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
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
          {isEraser ? 'Eraser Diameter Presets' : 'Thickness Presets'}
        </label>
        <div className="grid grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {(['S', 'M', 'L', 'XL'] as const).map((preset) => {
            const widthVal = isEraser ? ERASER_SIZE_PRESETS[preset] : STROKE_WIDTH_PRESETS[preset];
            const isSelected = currentWidth === widthVal;
            return (
              <button
                key={preset}
                onClick={() => handleWidthChange(widthVal)}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
          label={isEraser ? 'Custom Diameter' : 'Custom Thickness'}
          value={currentWidth}
          min={isEraser ? 8 : 1}
          max={isEraser ? 72 : 48}
          onChange={handleWidthChange}
        />
        <div className="mt-3.5 flex items-center justify-center h-12 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
          {isEraser ? (
            <div
              className="rounded-full border-2 border-dashed border-indigo-500 bg-indigo-500/15 transition-all shadow-inner"
              style={{
                width: `${Math.min(40, currentWidth)}px`,
                height: `${Math.min(40, currentWidth)}px`,
              }}
            />
          ) : (
            <div
              className="rounded-full transition-all shadow-sm"
              style={{
                backgroundColor: currentColor,
                width: `${Math.min(32, currentWidth)}px`,
                height: `${Math.min(32, currentWidth)}px`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
