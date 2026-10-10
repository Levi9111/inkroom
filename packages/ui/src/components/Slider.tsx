import React from 'react';
import * as RadixSlider from '@radix-ui/react-slider';
import { cn } from '../utils/cn';

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  label?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 1,
  max = 50,
  step = 1,
  onChange,
  className,
  label,
}) => {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>{label}</span>
          <span>{value}px</span>
        </div>
      )}
      <RadixSlider.Root
        className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
        value={[value]}
        onValueChange={(val) => onChange(val[0])}
        min={min}
        max={max}
        step={step}
      >
        <RadixSlider.Track className="bg-slate-200 dark:bg-slate-700 relative grow rounded-full h-1.5">
          <RadixSlider.Range className="absolute bg-indigo-600 rounded-full h-full" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className="block w-4 h-4 bg-white dark:bg-slate-100 shadow-md border border-slate-300 dark:border-slate-600 rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform"
          aria-label={label ?? 'Slider'}
        />
      </RadixSlider.Root>
    </div>
  );
};
