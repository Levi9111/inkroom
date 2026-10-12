import React, { useEffect } from 'react';
import { useBoardStore } from '../stores/boardStore';
import { joinBoard } from '../api/boardApi';
import { JoinModal } from '../components/JoinModal';
import { WhiteboardApp } from '../WhiteboardApp';

import { InkroomLogo } from '../components/InkroomLogo';

interface BoardPageProps {
  roomCode?: string;
  boardId?: string;
  teacherHash?: string;
}

export function BoardPage({ roomCode, boardId, teacherHash }: BoardPageProps) {
  const { session, setSession, isLoading, setLoading, error, setError, clearSession } = useBoardStore();

  useEffect(() => {
    async function initTeacher() {
      if (teacherHash && boardId) {
        // If current session already matches this board and teacher secret, keep it
        if (session && session.boardId === boardId && session.teacherSecret === teacherHash) {
          return;
        }

        setLoading(true);
        setError(null);
        try {
          const result = await joinBoard(boardId, 'Teacher', teacherHash);
          setSession({
            boardId: result.boardId,
            roomCode: roomCode || '',
            title: result.title,
            role: result.role,
            mode: result.mode,
            token: result.token,
            teacherSecret: teacherHash,
            participantId: result.participantId,
            userName: 'Teacher',
          });
        } catch (e: any) {
          setError(e.message || 'Failed to authenticate teacher session');
        } finally {
          setLoading(false);
        }
      }
    }

    initTeacher();
  }, [teacherHash, boardId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-white space-y-4 transition-colors">
        <InkroomLogo size={48} className="animate-bounce" />
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Connecting to classroom…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-rose-900/40 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-500 flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Classroom Access Error</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{error}</p>
          </div>
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => {
                clearSession();
                window.location.href = '/';
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold py-3 rounded-xl text-sm transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Student arriving at /b/:roomCode without a session needs to enter their name
  if (!session && roomCode) {
    return <JoinModal roomCode={roomCode} />;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-white space-y-4 transition-colors">
        <InkroomLogo size={48} className="animate-pulse" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading classroom session…</p>
      </div>
    );
  }

  return <WhiteboardApp session={session} />;
}
