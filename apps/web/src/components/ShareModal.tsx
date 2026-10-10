import React, { useState } from 'react';
import { Copy, Check, QrCode, Lock, Share2 } from 'lucide-react';
import { Dialog, Button } from '@inkroom/ui';
import { useUIStore } from '../stores/uiStore';

export interface ShareModalProps {
  roomCode: string;
  boardId: string;
  teacherSecret?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  roomCode,
  boardId,
  teacherSecret,
}) => {
  const { isShareModalOpen, setShareModalOpen } = useUIStore();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTeacherLink, setCopiedTeacherLink] = useState(false);

  const studentUrl = `${window.location.origin}/b/${roomCode}`;
  const teacherUrl = teacherSecret
    ? `${window.location.origin}/t/${boardId}#${teacherSecret}`
    : '';

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <Dialog
      open={isShareModalOpen}
      onOpenChange={setShareModalOpen}
      title="Invite Students to Whiteboard"
      description="Students can join instantly without creating an account or providing email."
    >
      <div className="space-y-5">
        {/* Big Monospace Room Code for Projectors */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">
            Room Code
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono font-extrabold text-4xl text-indigo-600 dark:text-indigo-400 tracking-wider">
              {roomCode}
            </span>
            <button
              onClick={() => copyToClipboard(roomCode, setCopiedCode)}
              className="p-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"
              title="Copy Room Code"
            >
              {copiedCode ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Student Link */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Student Direct Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={studentUrl}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 outline-none select-all"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => copyToClipboard(studentUrl, setCopiedLink)}
              className="flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
        </div>

        {/* Teacher Private Link with Hash Secret */}
        {teacherUrl && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Teacher Control Link (Keep Secret)
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={teacherUrl}
                className="flex-1 bg-amber-50/50 dark:bg-amber-950/20 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/40 outline-none select-all font-mono"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => copyToClipboard(teacherUrl, setCopiedTeacherLink)}
                className="flex items-center gap-1.5"
              >
                {copiedTeacherLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedTeacherLink ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Secret remains in the URL fragment (#) and is never transmitted to server logs.
            </p>
          </div>
        )}
      </div>
    </Dialog>
  );
};
