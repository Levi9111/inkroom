import React, { useState } from 'react';
import {
  Home,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Share2,
  Users,
  Layers,
  Lock,
  Presentation,
  UserCheck,
  Download,
  Moon,
  Sun,
  Hand,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { InkroomLogo } from './InkroomLogo';
import type { Role, BoardMode } from '@inkroom/shared';

export interface TopBarProps {
  title: string;
  onTitleChange?: (newTitle: string) => void;
  pageIndex: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  role: Role;
  mode: BoardMode;
  onModeChange?: (mode: BoardMode) => void;
  participantCount: number;
  handRaisedCount?: number;
  roomCode?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  onTitleChange,
  pageIndex,
  totalPages,
  onPrevPage,
  onNextPage,
  role,
  mode,
  onModeChange,
  participantCount,
  handRaisedCount = 0,
  roomCode,
}) => {
  const {
    theme,
    setTheme,
    setShareModalOpen,
    setPagesDrawerOpen,
    setParticipantsDrawerOpen,
    setExportModalOpen,
    isHandRaised,
    toggleHandRaised,
  } = useUIStore();

  const [copied, setCopied] = useState(false);
  const isTeacher = role === 'teacher' || role === 'co-teacher';

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const cycleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'blackboard' : 'light';
    setTheme(nextTheme);
  };

  const modeIcons = {
    present: <Presentation className="w-4 h-4 text-indigo-500" />,
    collaborate: <Users className="w-4 h-4 text-emerald-500" />,
    individual: <UserCheck className="w-4 h-4 text-amber-500" />,
    locked: <Lock className="w-4 h-4 text-rose-500" />,
  };

  const modeLabels = {
    present: 'Presenting',
    collaborate: 'Collaborating',
    individual: 'Individual',
    locked: 'Locked',
  };

  return (
    <header className="h-18 px-4 sm:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between select-none z-30 transition-colors shadow-xs">
      {/* Left: Home Navigation, Branding, Document Title & Room Code */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        {/* Direct Link to Home Page */}
        <button
          onClick={handleGoHome}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group"
          title="Return to Home Dashboard (Exit Classroom)"
        >
          <Home className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          <span className="hidden sm:inline">Home</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hidden sm:block" />

        <a href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" title="Back to Inkroom Home">
          <InkroomLogo size={28} />
          <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white hidden lg:inline">Inkroom</span>
        </a>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Board Title with subtle hover ring */}
        <div className="relative flex items-center min-w-0">
          <input
            type="text"
            value={title}
            disabled={!isTeacher}
            onChange={(e) => onTitleChange?.(e.target.value)}
            className="font-semibold text-sm text-slate-800 dark:text-slate-100 bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/40 rounded-lg px-2.5 py-1.5 outline-none transition max-w-[120px] sm:max-w-xs truncate border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/80 focus:border-indigo-500"
            title={isTeacher ? 'Click to rename classroom board' : title}
          />
        </div>

        {/* Quick Room Code Pill with Crisp Radius */}
        {roomCode && (
          <button
            onClick={handleCopyCode}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 transition-all duration-150 active:scale-95"
            title="Click to copy 6-character room code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px] font-sans font-bold text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>{roomCode}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Center: Slide/Page Navigator with Crisp Linear/Eraser Geometry */}
      <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/80 backdrop-blur-md p-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <button
          onClick={onPrevPage}
          disabled={pageIndex <= 1}
          aria-label="Previous page"
          className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all duration-150 active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => setPagesDrawerOpen(true)}
          className="px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all duration-150 flex items-center gap-1.5"
          title="Open page manager (all pages)"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>
            {pageIndex} / {totalPages}
          </span>
        </button>

        <button
          onClick={onNextPage}
          disabled={pageIndex >= totalPages}
          aria-label="Next page"
          className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all duration-150 active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Actions, Mode, Participants & Share */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Mode Selector for Teachers */}
        {isTeacher ? (
          <div className="relative hidden sm:flex items-center">
            <select
              value={mode}
              onChange={(e) => onModeChange?.(e.target.value as BoardMode)}
              className="appearance-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 text-xs font-semibold pl-8 pr-7 py-2 rounded-lg border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
            >
              <option value="present">Present (View only)</option>
              <option value="collaborate">Collaborate (Draw)</option>
              <option value="individual">Individual Pages</option>
              <option value="locked">Freeze / Locked</option>
            </select>
            <div className="absolute left-2.5 pointer-events-none">
              {modeIcons[mode]}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {modeIcons[mode]}
            <span>{modeLabels[mode]}</span>
          </div>
        )}

        {/* Raise Hand for Students */}
        {!isTeacher && (
          <button
            onClick={toggleHandRaised}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
              isHandRaised
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Hand className={`w-3.5 h-3.5 ${isHandRaised ? 'animate-bounce' : ''}`} />
            <span className="hidden md:inline">{isHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
          </button>
        )}

        {/* Participants Button */}
        <button
          onClick={() => setParticipantsDrawerOpen(true)}
          className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          title="Classroom participants"
        >
          <Users className="w-4 h-4" />
          {participantCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {participantCount}
            </span>
          )}
          {handRaisedCount > 0 && isTeacher && (
            <span className="absolute -top-1 -left-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-xs">
              ✋
            </span>
          )}
        </button>

        {/* Theme Switcher with rotation transition */}
        <button
          onClick={cycleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          title={`Active theme: ${theme} (Click to switch)`}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-indigo-500 transition-transform hover:rotate-12" />
          ) : theme === 'dark' ? (
            <Sparkles className="w-4 h-4 text-emerald-400 transition-transform hover:scale-110" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 transition-transform hover:rotate-45" />
          )}
        </button>

        {/* Export Button */}
        <button
          onClick={() => setExportModalOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          title="Export whiteboard as SVG / PNG / Bundle"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Primary Share Button */}
        <button
          onClick={() => setShareModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-2"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </header>
  );
};
