import React from 'react';
import { cn } from '../utils/cn';
import { Tooltip } from './Tooltip';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  shortcut?: string;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'subtle';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, label, shortcut, isActive, size = 'md', variant = 'default', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-9 h-9 min-w-[36px] min-h-[36px]',
      md: 'w-11 h-11 min-w-[44px] min-h-[44px]', // 44px touch target minimum
      lg: 'w-12 h-12 min-w-[48px] min-h-[48px]', // 48px classroom mode default
    }[size];

    const stateClasses = isActive
      ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
      : variant === 'primary'
        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800';

    const button = (
      <button
        ref={ref}
        aria-label={label}
        aria-pressed={isActive}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed select-none',
          sizeClasses,
          stateClasses,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );

    if (label) {
      return (
        <Tooltip content={shortcut ? `${label} (${shortcut})` : label}>
          {button}
        </Tooltip>
      );
    }

    return button;
  }
);

IconButton.displayName = 'IconButton';
