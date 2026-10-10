import React, { useState } from 'react';
import { Image, FileCode, Archive, Download, Check } from 'lucide-react';
import { Dialog, Button } from '@inkroom/ui';
import { useUIStore } from '../stores/uiStore';

export interface ExportModalProps {
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportInkroom: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  onExportPng,
  onExportSvg,
  onExportInkroom,
}) => {
  const { isExportModalOpen, setExportModalOpen } = useUIStore();
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const handleDownload = (format: string, action: () => void) => {
    setDownloadingFormat(format);
    action();
    setTimeout(() => {
      setDownloadingFormat(null);
      setExportModalOpen(false);
    }, 800);
  };

  return (
    <Dialog
      open={isExportModalOpen}
      onOpenChange={setExportModalOpen}
      title="Export Lesson Whiteboard"
      description="Download your whiteboard pages for students, archiving, or offline notes."
    >
      <div className="grid grid-cols-1 gap-3 pt-2">
        {/* PNG Raster */}
        <button
          onClick={() => handleDownload('png', onExportPng)}
          className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                PNG Image (High Resolution)
              </div>
              <div className="text-xs text-slate-500">
                Sharable image of current page (2x retina quality)
              </div>
            </div>
          </div>
          {downloadingFormat === 'png' ? (
            <Check className="w-5 h-5 text-emerald-500" />
          ) : (
            <Download className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* SVG Vector */}
        <button
          onClick={() => handleDownload('svg', onExportSvg)}
          className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                SVG Vector File
              </div>
              <div className="text-xs text-slate-500">
                Infinitely scalable vector format without quality loss
              </div>
            </div>
          </div>
          {downloadingFormat === 'svg' ? (
            <Check className="w-5 h-5 text-emerald-500" />
          ) : (
            <Download className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* .inkroom bundle */}
        <button
          onClick={() => handleDownload('inkroom', onExportInkroom)}
          className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                Inkroom Project Bundle (.inkroom)
              </div>
              <div className="text-xs text-slate-500">
                Complete multi-page board data for backup and re-import
              </div>
            </div>
          </div>
          {downloadingFormat === 'inkroom' ? (
            <Check className="w-5 h-5 text-emerald-500" />
          ) : (
            <Download className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>
    </Dialog>
  );
};
