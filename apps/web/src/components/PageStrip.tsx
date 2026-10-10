import React from 'react';
import { Plus, Trash2, Copy, Grid, AlignJustify, Square, X } from 'lucide-react';
import { Button, IconButton } from '@inkroom/ui';
import { useUIStore } from '../stores/uiStore';
import type { PageMeta, PageBackground } from '@inkroom/shared';

export interface PageStripProps {
  pages: PageMeta[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  onDuplicatePage?: (id: string) => void;
  onDeletePage?: (id: string) => void;
  onChangeBackground?: (id: string, bg: PageBackground) => void;
}

export const PageStrip: React.FC<PageStripProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onChangeBackground,
}) => {
  const { isPagesDrawerOpen, setPagesDrawerOpen } = useUIStore();

  if (!isPagesDrawerOpen) return null;

  return (
    <aside className="fixed right-0 top-14 bottom-0 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-l border-slate-200 dark:border-slate-800 shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-14 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            Pages & Slides
          </span>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold px-2 py-0.5 rounded-full">
            {pages.length}
          </span>
        </div>
        <IconButton
          label="Close panel"
          size="sm"
          onClick={() => setPagesDrawerOpen(false)}
        >
          <X className="w-4 h-4" />
        </IconButton>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {pages.map((page, index) => {
          const isActive = page.id === activePageId;
          return (
            <div
              key={page.id}
              onClick={() => onSelectPage(page.id)}
              className={`group relative rounded-xl border-2 p-3 cursor-pointer transition-all ${
                isActive
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Page {index + 1}
                </span>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <IconButton
                    label="Duplicate page"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicatePage?.(page.id);
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </IconButton>
                  {pages.length > 1 && (
                    <IconButton
                      label="Delete page"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage?.(page.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </IconButton>
                  )}
                </div>
              </div>

              {/* Thumbnail Representation */}
              <div className="w-full h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                {page.background.type === 'grid' ? (
                  <Grid className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                ) : page.background.type === 'lined' ? (
                  <AlignJustify className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                ) : (
                  <Square className="w-8 h-8 text-slate-200 dark:text-slate-800" />
                )}
              </div>

              {/* Background Picker */}
              <div className="mt-2.5 flex items-center gap-1">
                <span className="text-[10px] font-semibold text-slate-400 mr-1 uppercase">BG:</span>
                <button
                  title="Blank background"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeBackground?.(page.id, { type: 'blank', color: '#FFFFFF' });
                  }}
                  className="px-1.5 py-0.5 text-[10px] rounded font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Blank
                </button>
                <button
                  title="Grid background"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeBackground?.(page.id, { type: 'grid', color: '#FFFFFF', spacing: 30 });
                  }}
                  className="px-1.5 py-0.5 text-[10px] rounded font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Grid
                </button>
                <button
                  title="Lined background"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeBackground?.(page.id, { type: 'lined', color: '#FFFFFF', spacing: 32 });
                  }}
                  className="px-1.5 py-0.5 text-[10px] rounded font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Lined
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: Add Page Button */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <Button onClick={onAddPage} className="w-full flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          <span>New Page</span>
        </Button>
      </div>
    </aside>
  );
};
