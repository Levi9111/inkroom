import React, { useState } from 'react';
import { createBoard, joinBoard } from '../api/boardApi';
import { useBoardStore } from '../stores/boardStore';

export function LandingPage() {
  const [roomCode, setRoomCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [boardTitle, setBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [createError, setCreateError] = useState('');
  const { setSession } = useBoardStore();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError('');
    try {
      const title = boardTitle.trim() || 'Classroom Whiteboard';
      const board = await createBoard(title);
      setSession({
        boardId: board.boardId,
        roomCode: board.roomCode,
        title: board.title,
        role: 'teacher',
        mode: 'present',
        token: board.teacherToken,
        teacherSecret: board.teacherSecret,
        userName: 'Teacher',
      });
      window.location.href = `/t/${board.boardId}#${board.teacherSecret}`;
    } catch (err: any) {
      setCreateError(err.message || 'Failed to initialize new classroom');
      setIsCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCode.trim().toUpperCase();
    const cleanName = studentName.trim();
    if (!cleanCode || !cleanName) return;

    setIsJoining(true);
    setJoinError('');
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
      window.location.href = `/b/${cleanCode}`;
    } catch (err: any) {
      setJoinError(err.message || 'Could not join. Please check room code.');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/20 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-purple-600/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 right-0 w-[500px] h-[400px] bg-emerald-600/10 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/25">
              I
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Inkroom
                <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  v1.0
                </span>
              </span>
              <p className="text-xs text-slate-400 font-medium">Real-time collaborative classroom whiteboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Levi9111/inkroom"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60"
            >
              <span>⭐</span>
              <span>Open Source</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2 shadow-inner">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Zero Setup • Instant Real-time Collaboration • CRDT-Powered
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            The Interactive Whiteboard Built for Teachers & Classes
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Free, lightweight, and ultra-fast. No mandatory account setup. Launch a board in one click, share a 6-letter room code, and teach together with live cursor sync.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full mb-16">
          {/* Create Board Card */}
          <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/30 via-slate-900/40 to-slate-900/60 p-8 backdrop-blur-xl shadow-2xl relative group hover:border-indigo-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-2xl font-bold">
                🚀
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Create a Classroom</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Start as Teacher with full control over pages, modes, permissions, and laser pointer.
                </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Class / Lesson Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Calculus 101 - Derivatives"
                    value={boardTitle}
                    onChange={(e) => setBoardTitle(e.target.value)}
                    maxLength={100}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>

                {createError && (
                  <p className="text-rose-400 text-xs bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-xl">
                    {createError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-lg shadow-indigo-600/30 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Starting Classroom…</span>
                    </>
                  ) : (
                    <span>Launch New Board</span>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/60 text-xs text-slate-500 flex items-center gap-2">
              <span>🔒</span>
              <span>Generates a private teacher secret URL for automatic full privileges</span>
            </div>
          </div>

          {/* Join Board Card */}
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/60 p-8 backdrop-blur-xl shadow-2xl relative group hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl font-bold">
                🎓
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Join Existing Class</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Have a 6-letter room code from your teacher? Jump directly into the live board.
                </p>
              </div>

              <form onSubmit={handleJoin} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Room Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INK-4821"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={16}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 font-mono tracking-widest uppercase focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jordan Rivera"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    maxLength={40}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>

                {joinError && (
                  <p className="text-rose-400 text-xs bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-xl">
                    {joinError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isJoining || !roomCode.trim() || !studentName.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isJoining ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Connecting…</span>
                    </>
                  ) : (
                    <span>Enter Room</span>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/60 text-xs text-slate-500 flex items-center gap-2">
              <span>⚡</span>
              <span>Fast join with student role and real-time cursor presence</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center max-w-4xl mx-auto w-full">
          <div className="p-5 rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm space-y-1.5">
            <div className="text-xl">🖌️</div>
            <h3 className="font-bold text-sm text-white">Pressure Ink</h3>
            <p className="text-xs text-slate-400">Smooth pen, highlighter & shape geometric snapping</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm space-y-1.5">
            <div className="text-xl">📄</div>
            <h3 className="font-bold text-sm text-white">Multi-Page</h3>
            <p className="text-xs text-slate-400">Add infinite whiteboard pages synced via Yjs CRDTs</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm space-y-1.5">
            <div className="text-xl">🖼️</div>
            <h3 className="font-bold text-sm text-white">Image Upload</h3>
            <p className="text-xs text-slate-400">Paste images directly from clipboard or drag & drop</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm space-y-1.5">
            <div className="text-xl">🎯</div>
            <h3 className="font-bold text-sm text-white">Teacher Control</h3>
            <p className="text-xs text-slate-400">Present mode, raise hand, follow teacher & undo protection</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        Inkroom Monorepo Whiteboard • Built with React, Konva & Hocuspocus CRDT
      </footer>
    </div>
  );
}
