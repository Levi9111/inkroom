import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, BoardMode } from '@inkroom/shared';

export interface BoardSession {
  boardId: string;
  roomCode: string;
  title: string;
  role: Role;
  mode: BoardMode;
  token: string; // participant JWT
  teacherSecret?: string; // only set for teacher
  participantId?: string;
  userName?: string;
}

interface BoardStoreState {
  session: BoardSession | null;
  isLoading: boolean;
  error: string | null;
  setSession: (session: BoardSession) => void;
  clearSession: () => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
}

export const useBoardStore = create<BoardStoreState>()(
  persist(
    (set) => ({
      session: null,
      isLoading: false,
      error: null,
      setSession: (session) => set({ session, error: null }),
      clearSession: () => set({ session: null, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'inkroom-board-session',
      partialize: (state) => ({
        session: state.session
          ? {
              boardId: state.session.boardId,
              roomCode: state.session.roomCode,
              title: state.session.title,
              role: state.session.role,
              mode: state.session.mode,
              token: state.session.token,
              teacherSecret: state.session.teacherSecret,
              participantId: state.session.participantId,
              userName: state.session.userName,
            }
          : null,
      }),
    }
  )
);
