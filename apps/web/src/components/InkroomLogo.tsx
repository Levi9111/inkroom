import React from 'react';

interface InkroomLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const InkroomLogo: React.FC<InkroomLogoProps> = ({
  size = 32,
  className = '',
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric Faceted Prism Logo inspired by Eraser.io */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-200 hover:scale-105 drop-shadow-md"
      >
        <defs>
          <linearGradient id="prism-top" x1="12" y1="8" x2="36" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="prism-left" x1="10" y1="20" x2="24" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#312E81" />
          </linearGradient>
          <linearGradient id="prism-right" x1="24" y1="20" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient id="prism-accent" x1="16" y1="16" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#FB7185" />
          </linearGradient>
        </defs>

        {/* Isometric Facet 1: Top Diamond Plane */}
        <path
          d="M24 6L38 14L24 22L10 14L24 6Z"
          fill="url(#prism-top)"
        />

        {/* Isometric Facet 2: Left Side Face */}
        <path
          d="M10 14L24 22V38L10 30V14Z"
          fill="url(#prism-left)"
        />

        {/* Isometric Facet 3: Right Side Face */}
        <path
          d="M24 22L38 14V30L24 38V22Z"
          fill="url(#prism-right)"
        />

        {/* Vibrant Eraser Core Highlight: Folded Inner Chevron Strip */}
        <path
          d="M24 16L31 20L24 24L17 20L24 16Z"
          fill="#FFFFFF"
          fillOpacity="0.85"
        />
        <path
          d="M17 20L24 24V32L17 28V20Z"
          fill="url(#prism-accent)"
        />
        <path
          d="M24 24L31 20V28L24 32V24Z"
          fill="#E11D48"
        />
      </svg>

      {showText && (
        <div className="flex items-center gap-1.5 font-bold tracking-tight text-slate-900 dark:text-white">
          <span className="text-lg font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-100 dark:to-slate-200 bg-clip-text text-transparent">
            Inkroom
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            PRO
          </span>
        </div>
      )}
    </div>
  );
};
