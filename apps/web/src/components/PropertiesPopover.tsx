import React from 'react';
import { X } from 'lucide-react';
import { PROJECTOR_INK_COLORS, HIGHLIGHTER_COLORS, STROKE_WIDTH_PRESETS } from '@inkroom/shared';
import { Slider } from '@inkroom/ui';
import { useUIStore } from '../stores/uiStore';

export interface PropertiesPopoverProps {
  onClose: () => void;
}

export const PropertiesPopover: React.FC<PropertiesPopoverProps> = ({ onClose }) => {
  const {
    activeTool,
    strokeColor,
    setColor,
    strokeWidth,
    setStrokeWidth,
    highlighterColor,
    highlighterWidth,
  } = useUIStore();

  const isHighlighter = activeTool === 'highlighter';
  const swatches = isHighlighter ? HIGHLIGHTER_COLORS : PROJECTOR_INK_COLORS;
  const currentColor = isHighlighter ? highlighterColor : strokeColor;
  const currentWidth = isHighlighter ? highlighterWidth : strokeWidth;

  return (
    <div className="absolute left-16 top-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          {isHighlighter ? 'Highlighter' : 'Pen'} Properties
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded p-0.5"
          aria-label="Close properties"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Color Swatches */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          Projector-Tuned Colors
        </label>
        <div className="grid grid-cols-4 gap-2">
          {swatches.map((color) => {
            const isSelected = currentColor.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.hex}
                onClick={() => setColor(color.hex)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105 shadow-md'
                    : 'hover:scale-105'
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

      {/* Preset Widths */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          Size Presets
        </label>
        <div className="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['S', 'M', 'L', 'XL'] as const).map((preset) => {
            const widthVal = STROKE_WIDTH_PRESETS[preset];
            const isSelected = currentWidth === widthVal;
            return (
              <button
                key={preset}
                onClick={() => setStrokeWidth(widthVal)}
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
          label="Custom Thickness"
          value={currentWidth}
          min={1}
          max={48}
          onChange={(val) => setStrokeWidth(val)}
        />
        <div className="mt-3 flex items-center justify-center h-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div
            className="rounded-full transition-all"
            style={{
              backgroundColor: currentColor,
              width: `${Math.min(28, currentWidth)}px`,
              height: `${Math.min(28, currentWidth)}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
