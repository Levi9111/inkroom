import React, { useState } from 'react';
import { joinBoard } from '../api/boardApi';
import { useBoardStore } from '../stores/boardStore';
import { useUIStore } from '../stores/uiStore';

import { InkroomLogo } from './InkroomLogo';

interface JoinModalProps {
  roomCode?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function JoinModal({ roomCode: initialRoomCode, onSuccess, onCancel }: JoinModalProps) {
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setSession } = useBoardStore();
  const { setJoinModalOpen } = useUIStore();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCode.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanCode) {
      setError('Please enter a room code');
      return;
    }
    if (!cleanName) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await joinBoard(cleanCode, cleanName);
      setSession({
        boardId: result.boardId,
        roomCode: cleanCode,
        title: result.title,
        role: result.role,
        mode: result.mode,
        token: result.token,
        participantId: result.participantId,
        userName: cleanName,
      });
      setJoinModalOpen(false);
      onSuccess?.();
    } catch (e: any) {
      setError(e.message || 'Could not join — check the room code and try again');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setJoinModalOpen(false);
    if (onCancel) {
      onCancel();
    } else if (!useBoardStore.getState().session) {
      window.location.href = '/';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-8 max-w-md w-full space-y-6 relative overflow-hidden transition-colors">
        {/* Subtle accent gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="text-center space-y-3 pt-2">
          <div className="flex justify-center">
            <InkroomLogo size={44} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Join Classroom</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {initialRoomCode
              ? `Entering classroom ${initialRoomCode}`
              : 'Enter your room code and name to collaborate in real-time'}
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          {!initialRoomCode && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Room Code
              </label>
              <input
                type="text"
                placeholder="e.g. INK-4821"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={16}
                className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-4 py-3 text-sm font-mono tracking-widest uppercase transition outline-none"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Your Name
            </label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Alex Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-4 py-3 text-sm transition outline-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="w-1/3 py-3 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-150 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || (!initialRoomCode && !roomCode.trim())}
              className="w-2/3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-md shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Connecting…</span>
                </>
              ) : (
                'Enter Classroom'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
