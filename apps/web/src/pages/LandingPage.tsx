import React, { useState } from 'react';
import { createBoard } from '../api/boardApi';
import { useBoardStore } from '../stores/boardStore';
import { JoinModal } from '../components/JoinModal';
import {
  Sparkles,
  Presentation,
  Users,
  PenTool,
  Layers,
  WifiOff,
  FileCode2,
  ArrowRight,
  ShieldCheck,
  Zap,
  MousePointer2,
  Highlighter,
  Eraser,
  Square,
  Circle,
  Hand,
  Command,
  Download,
  Github,
  Activity,
  Radio,
  Undo2,
  Eye,
  SlidersHorizontal,
  Sun,
  Moon,
} from 'lucide-react';
import { InkroomLogo } from '../components/InkroomLogo';
import { useUIStore } from '../stores/uiStore';

export function LandingPage() {
  const [boardTitle, setBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'blackboard' | 'light'>('dark');
  const [previewMode, setPreviewMode] = useState<'present' | 'collaborate'>('present');
  const [previewActiveTool, setPreviewActiveTool] = useState<'pen' | 'highlighter' | 'laser' | 'shapes'>('pen');

  const { setSession } = useBoardStore();
  const { theme, setTheme } = useUIStore();

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased transition-colors">
      {/* Background ambient lighting & grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-canvas-dots-light dark:bg-canvas-dots opacity-60" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-indigo-600/10 dark:bg-indigo-600/15 blur-[140px] rounded-full animate-pulse-slow" />
        <div className="absolute top-1/3 -left-48 w-[600px] h-[550px] bg-purple-600/5 dark:bg-purple-600/10 blur-[150px] rounded-full animate-float-slow" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[500px] bg-emerald-600/5 dark:bg-emerald-600/10 blur-[160px] rounded-full animate-pulse-slow" />
      </div>

      {/* Global Navigation Bar: Fixed & Taller with Blur */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/90 dark:border-white/[0.08] bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo & Live Status */}
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-3 group">
              <InkroomLogo size={36} />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                    Inkroom
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-white/[0.06] border border-slate-300/60 dark:border-white/10 text-slate-600 dark:text-slate-300">
                    v1.0
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Real-time classroom whiteboard</span>
              </div>
            </a>

            <div className="hidden lg:flex items-center gap-2.5 pl-4 border-l border-slate-200 dark:border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Yjs CRDT Engine • Zero Latency</span>
            </div>
          </div>

          {/* Quick Navigation Anchors */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#preview" className="hover:text-white transition-colors">Canvas Preview</a>
            <a href="#shortcuts" className="hover:text-white transition-colors">Shortcuts</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-100/80 dark:bg-white/[0.03] hover:bg-slate-200/80 dark:hover:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" /> : <Moon className="w-4 h-4 text-indigo-500 transition-transform hover:rotate-12" />}
            </button>

            <a
              href="https://github.com/Levi9111/inkroom"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-100/80 dark:bg-white/[0.03] hover:bg-slate-200/80 dark:hover:bg-white/[0.06] transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>

            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-100/80 dark:bg-slate-900/60 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-xs"
            >
              Enter Code
            </button>

            <button
              onClick={() => handleCreate()}
              disabled={isCreating}
              className="text-xs font-bold text-white px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-md shadow-indigo-600/25 flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Instant Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-6 mb-12">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-medium shadow-inner backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Zero Mandatory Signups • Peer CRDT Sync • Teacher-Locked Presentation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            The Real-Time Whiteboard <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-100 to-purple-300 bg-clip-text text-transparent">
              Built for Teachers & Classes
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Instant online classrooms without accounts or subscription paywalls. Launch a board in one click, share a 6-letter room code, and teach with smooth pressure ink and live participant cursors.
          </p>

          {/* Unified Command Launcher */}
          <div className="pt-2 max-w-2xl mx-auto w-full">
            <form
              onSubmit={handleCreate}
              className="relative rounded-xl border border-slate-200 dark:border-white/15 bg-white/90 dark:bg-slate-900/80 p-2 backdrop-blur-2xl shadow-xl shadow-indigo-950/10 dark:shadow-indigo-950/40 flex flex-col sm:flex-row items-center gap-2 group focus-within:border-indigo-500/60 transition-all"
            >
              <div className="relative flex-1 w-full pl-3 pr-2 py-1">
                <input
                  type="text"
                  placeholder="Optional lesson title (e.g. Calculus 101 — Derivatives)"
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  maxLength={100}
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 whitespace-nowrap"
                >
                  Join with Code
                </button>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-lg transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Starting…</span>
                    </>
                  ) : (
                    <>
                      <span>Start Classroom</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {createError && (
              <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs text-center">
                {createError}
              </div>
            )}

            <div className="mt-3 flex items-center justify-center gap-6 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Private teacher secret URL</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant WebSocket connect</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Command className="w-3.5 h-3.5 text-slate-400" />
                <span>Press Enter to launch</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hero Centerpiece: Simulated Interactive Whiteboard Stage */}
        <section id="preview" className="w-full max-w-5xl mx-auto my-12 scroll-mt-28">
          <div className="relative rounded-xl border border-slate-200 dark:border-white/15 bg-white/80 dark:bg-slate-900/50 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* Interactive Stage Header & Toolbar Controls */}
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-slate-950/80 flex flex-wrap items-center justify-between gap-4">
              {/* Window Dots & Board Meta */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="h-4 w-[1px] bg-white/10" />
                <span className="text-xs font-semibold text-slate-200">
                  Calculus 101 — Derivatives & Curve Sketching
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Teacher View
                </span>
              </div>

              {/* Theme & Mode Switcher Controls */}
              <div className="flex items-center gap-3">
                {/* Mode Selector */}
                <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-white/10 text-[11px] font-medium">
                  <button
                    onClick={() => setPreviewMode('present')}
                    className={`px-2.5 py-1 rounded-md transition ${previewMode === 'present' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Present Mode
                  </button>
                  <button
                    onClick={() => setPreviewMode('collaborate')}
                    className={`px-2.5 py-1 rounded-md transition ${previewMode === 'collaborate' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Collaborate
                  </button>
                </div>

                {/* Theme Selector */}
                <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-white/10 text-[11px]">
                  <button
                    onClick={() => setPreviewTheme('dark')}
                    className={`px-2 py-1 rounded-md transition ${previewTheme === 'dark' ? 'bg-white/10 text-white font-bold' : 'text-slate-400'}`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setPreviewTheme('blackboard')}
                    className={`px-2 py-1 rounded-md transition ${previewTheme === 'blackboard' ? 'bg-emerald-900/50 text-emerald-300 font-bold' : 'text-slate-400'}`}
                  >
                    Blackboard
                  </button>
                  <button
                    onClick={() => setPreviewTheme('light')}
                    className={`px-2 py-1 rounded-md transition ${previewTheme === 'light' ? 'bg-white text-slate-900 font-bold' : 'text-slate-400'}`}
                  >
                    Light
                  </button>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-medium text-slate-300">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>14 Active</span>
                </div>
              </div>
            </div>

            {/* Simulated Canvas Surface */}
            <div
              className={`relative h-[480px] w-full overflow-hidden transition-colors duration-300 select-none ${
                previewTheme === 'dark'
                  ? 'bg-slate-950 text-slate-100 bg-canvas-dots'
                  : previewTheme === 'blackboard'
                  ? 'bg-[#193326] text-emerald-100'
                  : 'bg-white text-slate-900 bg-canvas-dots-light'
              }`}
            >
              {/* Top Page Strip Pill */}
              <div className="absolute top-4 left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md text-xs font-semibold text-slate-300">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Page 1 / 3: Derivatives of Polynomials</span>
              </div>

              {/* Hand Raised Alert Banner inside Whiteboard */}
              <div className="absolute top-4 right-6 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-lg backdrop-blur-md animate-bounce">
                <Hand className="w-3.5 h-3.5 text-amber-400" />
                <span>Elena Chen raised hand</span>
              </div>

              {/* Vector Diagram on Canvas: Coordinate Plane and Parabola */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {/* Grid Axes */}
                <path d="M 220 380 L 220 80" stroke={previewTheme === 'light' ? '#cbd5e1' : '#334155'} strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 80 280 L 680 280" stroke={previewTheme === 'light' ? '#cbd5e1' : '#334155'} strokeWidth="2" strokeDasharray="4 4" />

                {/* Parabola Curve f(x) = x^2 - 4x + 3 */}
                <path
                  d="M 120 120 Q 220 360 480 90"
                  fill="none"
                  stroke={previewTheme === 'blackboard' ? '#34d399' : '#6366f1'}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />

                {/* Tangent Line Slope */}
                <path
                  d="M 160 290 L 380 150"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                />

                {/* Laser Pointer Glow Circle and Trail */}
                <circle cx="280" cy="215" r="7" fill="#f43f5e" />
                <circle cx="280" cy="215" r="18" fill="#f43f5e" opacity="0.25" />
              </svg>

              {/* Handwritten Formula Text Mock */}
              <div className="absolute top-28 left-64 z-10 font-mono text-sm sm:text-base space-y-1">
                <div className={`font-bold px-3 py-1 rounded-lg backdrop-blur-sm border ${previewTheme === 'light' ? 'bg-slate-100/80 border-slate-300 text-slate-800' : 'bg-slate-900/60 border-white/10 text-indigo-300'}`}>
                  f(x) = x² - 4x + 3
                </div>
                <div className={`text-xs pl-3 ${previewTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  f'(x) = 2x - 4 &nbsp;→&nbsp; slope at x=3 is m=2
                </div>
              </div>

              {/* Simulated Participant Cursor 1: Teacher (Active Animated Laser Trail) */}
              <div className="absolute top-[215px] left-[280px] z-20 flex flex-col items-start pointer-events-none transition-all duration-700 animate-laser-glide">
                <MousePointer2 className="w-5 h-5 text-rose-500 fill-rose-500 drop-shadow-md -rotate-45" />
                <div className="ml-3 -mt-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-lg flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  <span>Prof. Davis (Laser Pointer)</span>
                </div>
              </div>

              {/* Simulated Participant Cursor 2: Student (Animated Glide) */}
              <div className="absolute top-[320px] left-[520px] z-20 flex flex-col items-start pointer-events-none transition-all duration-700 animate-student-float">
                <MousePointer2 className="w-5 h-5 text-emerald-400 fill-emerald-400 drop-shadow-md -rotate-45" />
                <div className="ml-3 -mt-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-semibold text-[10px] shadow-lg">
                  Jordan Rivera (Student)
                </div>
              </div>

              {/* Simulated Participant Cursor 3: Hand Raised Student */}
              <div className="absolute top-[140px] left-[660px] z-20 flex flex-col items-start pointer-events-none transition-all duration-700">
                <MousePointer2 className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-md -rotate-45" />
                <div className="ml-3 -mt-1 px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-semibold text-[10px] shadow-lg flex items-center gap-1">
                  <span>✋ Elena Chen</span>
                </div>
              </div>

              {/* Floating Tool Dock Simulation */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1.5 rounded-xl border border-slate-200/90 dark:border-white/15 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl">
                <button
                  onClick={() => setPreviewActiveTool('pen')}
                  className={`p-2 rounded-lg transition-all duration-150 active:scale-95 ${previewActiveTool === 'pen' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                  title="Pen (P)"
                >
                  <PenTool className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewActiveTool('highlighter')}
                  className={`p-2 rounded-lg transition-all duration-150 active:scale-95 ${previewActiveTool === 'highlighter' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                  title="Highlighter (H)"
                >
                  <Highlighter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewActiveTool('shapes')}
                  className={`p-2 rounded-lg transition-all duration-150 active:scale-95 ${previewActiveTool === 'shapes' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                  title="Shapes (S)"
                >
                  <Square className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewActiveTool('laser')}
                  className={`p-2 rounded-lg transition-all duration-150 active:scale-95 ${previewActiveTool === 'laser' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                  title="Laser Pointer (L)"
                >
                  <Radio className="w-4 h-4" />
                </button>
                <div className="h-5 w-[1px] bg-slate-200 dark:bg-white/10 mx-1" />
                <button className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all duration-150 active:scale-95" title="Undo (Ctrl+Z)">
                  <Undo2 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all duration-150 active:scale-95" title="Export">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Showcase: Asymmetrical 4-Card Bento Grid */}
        <section id="features" className="w-full max-w-6xl mx-auto py-16 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
              Classroom-First Engineering
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Crafted specifically for educators, students, and live lectures
            </p>
            <p className="text-sm text-slate-400">
              Every detail is engineered for frictionless real-time teaching without cognitive overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1 (Large - 2 cols): Teacher Command & Control */}
            <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-gradient-to-b dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-slate-900/60 p-8 backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/40 interactive-hover flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-600/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Presentation className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Teacher Command & Classroom Moderation
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                    Switch between <strong>Present Mode</strong> (locks canvas for lecture explanation) and <strong>Collaborative Mode</strong> (students solve problems together). Manage student hand-raising queues and clear accidental strokes with teacher authority.
                  </p>
                </div>
              </div>

              {/* Sub-feature Badges */}
              <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/10 grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/5 space-y-1">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-300">Laser Pointer</span>
                  <p className="text-[11px] text-slate-500">Decaying light trails highlight key steps without cluttering the board.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/5 space-y-1">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-300">Raise Hand Queue</span>
                  <p className="text-[11px] text-slate-500">Live student notifications with count badges in the top navigation bar.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/5 space-y-1">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-300">Follow Teacher</span>
                  <p className="text-[11px] text-slate-500">Keep all student screens focused on the exact slide and viewport you teach.</p>
                </div>
              </div>
            </div>

            {/* Bento Card 2 (1 col): Local-First Offline Resilience */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 p-8 backdrop-blur-xl relative group hover:border-amber-500/40 interactive-hover flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-amber-600/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <WifiOff className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Zero-Loss Offline Persistence
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Powered by local IndexedDB. If classroom Wi-Fi hiccups or drops, your handwriting stays intact and automatically re-synchronizes the instant connection is restored.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>Automatic background reconnection</span>
              </div>
            </div>

            {/* Bento Card 3 (1 col): Fluid Pressure Ink Engine */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 p-8 backdrop-blur-xl relative group hover:border-emerald-500/40 interactive-hover flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-600/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <PenTool className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Pressure Ink & Clipboard Pasting
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Smooth velocity-interpolated freehand lines, translucent highlighters, geometric snapping for diagrams, and direct image pasting from your system clipboard.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs font-bold">60+ FPS</span>
                <span>Hardware-accelerated Konva 2D stage</span>
              </div>
            </div>

            {/* Bento Card 4 (Large - 2 cols): Open Formats & Vector Export */}
            <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-gradient-to-b dark:from-purple-950/20 dark:via-slate-900/40 dark:to-slate-900/60 p-8 backdrop-blur-xl relative group hover:border-purple-500/40 interactive-hover flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-purple-600/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <FileCode2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Vector Export & Open Document Portability
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                    Never lose your lecture material to proprietary closed platforms. Export entire multi-page lecture notes to resolution-independent SVG vector graphics, presentation PNGs, or raw <code>.inkroom</code> bundle files.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-3 text-xs">
                <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-mono font-semibold">
                  .SVG Vector Export
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-mono font-semibold">
                  .PNG High-DPI Slide
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-mono font-semibold">
                  .inkroom JSON Document
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts & Technical Architecture Specifications */}
        <section id="shortcuts" className="w-full max-w-6xl mx-auto py-16 scroll-mt-28">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Keyboard Shortcuts Table */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 p-8 backdrop-blur-xl space-y-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Command className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Keyboard-First Productivity</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Control tools and navigation rapidly during lectures</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-600 dark:text-slate-300">Pen Drawing Tool</span>
                  <kbd className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono text-slate-700 dark:text-slate-200">P</kbd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-600 dark:text-slate-300">Highlighter Marker</span>
                  <kbd className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono text-slate-700 dark:text-slate-200">H</kbd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-600 dark:text-slate-300">Geometric Shapes</span>
                  <kbd className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono text-slate-700 dark:text-slate-200">S</kbd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-600 dark:text-slate-300">Teacher Laser Pointer</span>
                  <kbd className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono text-slate-700 dark:text-slate-200">L</kbd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-600 dark:text-slate-300">Pan Canvas</span>
                  <kbd className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono text-slate-700 dark:text-slate-200">Space + Drag</kbd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600 dark:text-slate-300">Undo Stroke</span>
                  <kbd className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono text-slate-700 dark:text-slate-200">Ctrl + Z</kbd>
                </div>
              </div>
            </div>

            {/* Architecture Specs */}
            <div id="architecture" className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 p-8 backdrop-blur-xl space-y-6 scroll-mt-28 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technical Architecture</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Open-source foundations built for reliability</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">&lt; 15 ms</span>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">CRDT Sync Latency</p>
                  <p className="text-[11px] text-slate-500">Binary WebSocket payloads via Hocuspocus</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">Zero</span>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Accounts Required</p>
                  <p className="text-[11px] text-slate-500">Anonymous session tokens with role claims</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">100%</span>
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Open Source</p>
                  <p className="text-[11px] text-slate-500">Permissive MIT License on GitHub</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">Local-First</span>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">IndexedDB Cache</p>
                  <p className="text-[11px] text-slate-500">Never lose a drawing on network disconnect</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Technical Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950 py-12 text-slate-500 dark:text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <InkroomLogo size={28} />
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">Inkroom</span>
              <p className="text-[11px] text-slate-500">Free, real-time classroom whiteboard • MIT License</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#shortcuts" className="hover:text-white transition">Shortcuts</a>
            <a href="#architecture" className="hover:text-white transition">Architecture</a>
            <a href="https://github.com/Levi9111/inkroom" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1">
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>

          <p className="text-[11px] text-slate-500">
            Built with React, Konva & Yjs CRDT
          </p>
        </div>
      </footer>

      {/* Join Modal Component */}
      {isJoinModalOpen && (
        <JoinModal
          onSuccess={() => {
            const currentSession = useBoardStore.getState().session;
            if (currentSession?.roomCode) {
              window.location.href = `/b/${currentSession.roomCode}`;
            }
          }}
          onCancel={() => setIsJoinModalOpen(false)}
        />
      )}
    </div>
  );
}
