import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
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
} from 'lucide-react';
import { Button, IconButton, Badge } from '@inkroom/ui';
import { useUIStore } from '../stores/uiStore';
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

  const isTeacher = role === 'teacher' || role === 'co-teacher';

  const modeIcons = {
    present: <Presentation className="w-4 h-4 text-indigo-500" />,
    collaborate: <Users className="w-4 h-4 text-emerald-500" />,
    individual: <UserCheck className="w-4 h-4 text-amber-500" />,
    locked: <Lock className="w-4 h-4 text-red-500" />,
  };

  const modeLabels = {
    present: 'Presenting',
    collaborate: 'Collaborating',
    individual: 'Individual',
    locked: 'Locked',
  };

  return (
    <header className="h-14 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between select-none z-30 shadow-sm transition-colors">
      {/* Left: Branding & Board Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            I
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 hidden sm:inline text-base tracking-tight">
            Inkroom
          </span>
        </div>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        <input
          type="text"
          value={title}
          disabled={!isTeacher}
          onChange={(e) => onTitleChange?.(e.target.value)}
          className="font-medium text-sm text-slate-700 dark:text-slate-200 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 outline-none transition-all max-w-[180px] sm:max-w-xs truncate"
          title={isTeacher ? 'Click to rename board' : title}
        />
      </div>

      {/* Center: Page Navigator */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
        <IconButton
          label="Previous page"
          size="sm"
          onClick={onPrevPage}
          disabled={pageIndex <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </IconButton>

        <button
          onClick={() => setPagesDrawerOpen(true)}
          className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          title="Open page manager"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>
            {pageIndex} / {totalPages}
          </span>
        </button>

        <IconButton
          label="Next page"
          size="sm"
          onClick={onNextPage}
          disabled={pageIndex >= totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </IconButton>
      </div>

      {/* Right: Classroom Mode, Participants, Actions */}
      <div className="flex items-center gap-2">
        {/* Mode Selector for Teachers */}
        {isTeacher ? (
          <div className="relative flex items-center">
            <select
              value={mode}
              onChange={(e) => onModeChange?.(e.target.value as BoardMode)}
              className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold pl-7 pr-7 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="present">Present (View only)</option>
              <option value="collaborate">Collaborate (Draw)</option>
              <option value="individual">Individual Pages</option>
              <option value="locked">Freeze / Locked</option>
            </select>
            <div className="absolute left-2 pointer-events-none">
              {modeIcons[mode]}
            </div>
          </div>
        ) : (
          <Badge variant={mode === 'collaborate' ? 'success' : 'default'} className="flex items-center gap-1">
            {modeIcons[mode]}
            <span>{modeLabels[mode]}</span>
          </Badge>
        )}

        {/* Raise Hand for Students */}
        {!isTeacher && (
          <Button
            size="sm"
            variant={isHandRaised ? 'primary' : 'secondary'}
            onClick={toggleHandRaised}
            className="flex items-center gap-1.5"
          >
            <Hand className={`w-3.5 h-3.5 ${isHandRaised ? 'animate-bounce' : ''}`} />
            <span className="hidden md:inline">{isHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
          </Button>
        )}

        {/* Participants Button */}
        <IconButton
          label="Participants"
          size="sm"
          onClick={() => setParticipantsDrawerOpen(true)}
          className="relative"
        >
          <Users className="w-4 h-4" />
          {participantCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {participantCount}
            </span>
          )}
          {handRaisedCount > 0 && isTeacher && (
            <span className="absolute -top-1 -left-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              ✋
            </span>
          )}
        </IconButton>

        {/* Theme Switcher */}
        <IconButton
          label={`Theme: ${theme}`}
          size="sm"
          onClick={() =>
            setTheme(
              theme === 'light' ? 'dark' : theme === 'dark' ? 'blackboard' : 'light'
            )
          }
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : theme === 'dark' ? (
            <span className="text-xs font-bold text-emerald-400">BB</span>
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </IconButton>

        {/* Export Button */}
        <IconButton label="Export whiteboard" size="sm" onClick={() => setExportModalOpen(true)}>
          <Download className="w-4 h-4" />
        </IconButton>

        {/* Primary Share Button */}
        <Button
          size="sm"
          variant="primary"
          onClick={() => setShareModalOpen(true)}
          className="flex items-center gap-1.5 shadow-md"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </div>
    </header>
  );
};
