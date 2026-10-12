import { create } from 'zustand';
import type { ShapeKind } from '@inkroom/shared';

export type Tool =
  | 'select'
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'shape'
  | 'text'
  | 'laser';

export type AppTheme = 'light' | 'dark' | 'blackboard';

export interface UIState {
  activeTool: Tool;
  activeShapeKind: ShapeKind;
  strokeColor: string;
  strokeWidth: number;
  highlighterColor: string;
  highlighterWidth: number;
  eraserWidth: number;
  activePageId: string;
  zoom: number;
  panX: number;
  panY: number;
  theme: AppTheme;

  // Dialogs & drawers
  isShareModalOpen: boolean;
  isPagesDrawerOpen: boolean;
  isParticipantsDrawerOpen: boolean;
  isExportModalOpen: boolean;
  isJoinModalOpen: boolean;

  // Student specific
  isHandRaised: boolean;
  isFollowingTeacher: boolean;

  // Actions
  setTool: (tool: Tool) => void;
  setShapeKind: (kind: ShapeKind) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setPageId: (id: string) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
  setTheme: (theme: AppTheme) => void;
  setShareModalOpen: (open: boolean) => void;
  setPagesDrawerOpen: (open: boolean) => void;
  setParticipantsDrawerOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setJoinModalOpen: (open: boolean) => void;
  toggleHandRaised: () => void;
  setFollowingTeacher: (follow: boolean) => void;
}

const getInitialTheme = (): AppTheme => {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('inkroom-theme') as AppTheme;
    if (saved === 'light' || saved === 'dark' || saved === 'blackboard') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {}
  return 'light';
};

const applyThemeClasses = (theme: AppTheme) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark', 'theme-dark', 'theme-blackboard');
  if (theme === 'dark') {
    root.classList.add('dark', 'theme-dark');
  } else if (theme === 'blackboard') {
    root.classList.add('dark', 'theme-blackboard');
  }
};

const initialTheme = getInitialTheme();
applyThemeClasses(initialTheme);

export const useUIStore = create<UIState>((set) => ({
  activeTool: 'pen',
  activeShapeKind: 'rect',
  strokeColor: '#111827',
  strokeWidth: 4,
  highlighterColor: '#FACC15',
  highlighterWidth: 20,
  eraserWidth: 24,
  activePageId: 'page_1',
  zoom: 1,
  panX: 0,
  panY: 0,
  theme: initialTheme,

  isShareModalOpen: false,
  isPagesDrawerOpen: false,
  isParticipantsDrawerOpen: false,
  isExportModalOpen: false,
  isJoinModalOpen: false,

  isHandRaised: false,
  isFollowingTeacher: false,

  setTool: (tool) => set({ activeTool: tool }),
  setShapeKind: (kind) => set({ activeShapeKind: kind, activeTool: 'shape' }),
  setColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setPageId: (id) => set({ activePageId: id }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(8, zoom)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),
  setTheme: (theme) => {
    try {
      localStorage.setItem('inkroom-theme', theme);
    } catch {}
    applyThemeClasses(theme);
    set({ theme });
  },
  setShareModalOpen: (open) => set({ isShareModalOpen: open }),
  setPagesDrawerOpen: (open) => set({ isPagesDrawerOpen: open }),
  setParticipantsDrawerOpen: (open) => set({ isParticipantsDrawerOpen: open }),
  setExportModalOpen: (open) => set({ isExportModalOpen: open }),
  setJoinModalOpen: (open) => set({ isJoinModalOpen: open }),
  toggleHandRaised: () => set((state) => ({ isHandRaised: !state.isHandRaised })),
  setFollowingTeacher: (follow) => set({ isFollowingTeacher: follow }),
}));
