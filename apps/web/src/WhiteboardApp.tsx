import React, { useEffect, useRef, useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { CanvasEngine } from './engine/CanvasEngine';
import { CollaborationClient } from './engine/collaboration';
import { TopBar } from './components/TopBar';
import { ToolDock } from './components/ToolDock';
import { PageStrip } from './components/PageStrip';
import { ParticipantsPanel } from './components/ParticipantsPanel';
import { ShareModal } from './components/ShareModal';
import { ExportModal } from './components/ExportModal';
import { ReconnectBanner } from './components/ReconnectBanner';
import { useUIStore } from './stores/uiStore';
import { exportPageToSvg, serializeInkroomBundle } from '@inkroom/core';
import type { PageMeta, Role, BoardMode, AwarenessState, ImageElement } from '@inkroom/shared';
import type { BoardSession } from './stores/boardStore';
import { uploadAsset } from './api/boardApi';

export function WhiteboardApp({ session }: { session: BoardSession }) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const collabRef = useRef<CollaborationClient | null>(null);

  const {
    activeTool,
    activeShapeKind,
    strokeColor,
    strokeWidth,
    theme,
    isHandRaised,
  } = useUIStore();

  const {
    boardId,
    roomCode,
    title: initialTitle,
    role: initialRole,
    mode: initialMode,
    token,
    teacherSecret,
    userName,
    participantId,
  } = session;

  const [title, setTitle] = useState(initialTitle || 'Classroom Whiteboard');
  const [role] = useState<Role>(initialRole);
  const [mode, setMode] = useState<BoardMode>(initialMode);
  const [connStatus, setConnStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');

  // Pages state
  const [pages, setPages] = useState<PageMeta[]>([
    {
      id: 'page_1',
      index: 'a0',
      kind: 'shared',
      title: 'Page 1',
      background: { type: 'grid', color: '#FFFFFF', spacing: 30 },
    },
    {
      id: 'page_2',
      index: 'a1',
      kind: 'shared',
      title: 'Page 2',
      background: { type: 'lined', color: '#FFFFFF', spacing: 32 },
    },
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [participants, setParticipants] = useState<AwarenessState[]>([]);

  // Local undo stack availability
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const activePage = pages[currentPageIndex - 1] || pages[0];
  const activePageRef = useRef(activePage);
  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  // Callback to connect Hocuspocus provider for a specific page and wire it to CanvasEngine
  const switchToPage = useCallback((pageId: string) => {
    if (!collabRef.current || !engineRef.current) return;

    const pageManager = collabRef.current.setActivePage(pageId);

    const updateCanvasFromDoc = () => {
      engineRef.current?.setElements(pageManager.getAllElements());
      setCanUndo(pageManager.canUndo());
      setCanRedo(pageManager.canRedo());
    };

    pageManager.elementsMap.observe(updateCanvasFromDoc);
    updateCanvasFromDoc();
  }, []);

  // Initialize Collaboration & Canvas Engine
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const collab = new CollaborationClient({
      boardId,
      token,
      userName: userName || (role === 'teacher' ? 'Teacher' : 'Student'),
      userRole: role,
      userColor: role === 'teacher' ? '#4F46E5' : '#10B981',
      onConnectionStatusChange: (status) => setConnStatus(status),
      onRemoteCursorUpdate: (user) => {
        engineRef.current?.renderRemoteCursor(user.id, user.name, user.color, user.x, user.y);
      },
      onRemoteCursorRemove: (id) => {
        engineRef.current?.removeRemoteCursor(id);
      },
      onAwarenessChange: (states) => {
        setParticipants(states);
      },
    });
    collabRef.current = collab;

    const pageManager = collab.setActivePage(activePage.id);

    const engine = new CanvasEngine(canvasContainerRef.current, {
      onCommitElement: (element) => {
        const currentActivePage = activePageRef.current;
        const mgr = collabRef.current?.getOrCreatePageManager(currentActivePage.id);
        if (mgr) {
          mgr.setElement(element);
          setCanUndo(mgr.canUndo());
          setCanRedo(mgr.canRedo());
        }
      },
      onDeleteElement: (id) => {
        const currentActivePage = activePageRef.current;
        const mgr = collabRef.current?.getOrCreatePageManager(currentActivePage.id);
        if (mgr) {
          mgr.deleteElement(id);
          setCanUndo(mgr.canUndo());
          setCanRedo(mgr.canRedo());
        }
      },
      onPointerMove: (x, y) => {
        collab.broadcastCursor(x, y);
      },
      onUpdateDraft: (draft) => {
        collab.broadcastDraft(draft);
      },
      onImagePaste: async (file: File) => {
        if (!token) return;
        try {
          const asset = await uploadAsset(boardId, file, token);
          const imageEl: ImageElement = {
            id: 'img_' + nanoid(9),
            type: 'image',
            url: asset.url,
            src: asset.url,
            assetId: asset.assetId,
            x: 100,
            y: 100,
            width: 400,
            height: 300,
            rotation: 0,
            z: 'a' + Date.now().toString(36),
            author: participantId || 'user',
            createdAt: Date.now(),
          };
          const currentActivePage = activePageRef.current;
          const mgr = collabRef.current?.getOrCreatePageManager(currentActivePage.id);
          mgr?.setElement(imageEl);
        } catch (err) {
          console.error('Image paste failed:', err);
        }
      },
    });
    engineRef.current = engine;

    const updateCanvasFromDoc = () => {
      engine.setElements(pageManager.getAllElements());
      setCanUndo(pageManager.canUndo());
      setCanRedo(pageManager.canRedo());
    };
    pageManager.elementsMap.observe(updateCanvasFromDoc);
    updateCanvasFromDoc();

    return () => {
      engine.destroy();
      collab.destroy();
    };
  }, [boardId, token]);

  // When active page changes, wire Hocuspocus provider and canvas
  useEffect(() => {
    if (activePage) {
      switchToPage(activePage.id);
    }
  }, [activePage.id, switchToPage]);

  // Update canvas background when page changes or theme toggles
  useEffect(() => {
    if (engineRef.current && activePage) {
      engineRef.current.drawBackground(activePage.background, theme);
    }
  }, [activePage, theme]);

  // Sync tool and color to canvas engine
  useEffect(() => {
    const isDarkBg = theme === 'dark' || theme === 'blackboard';
    const effectiveColor = isDarkBg && (strokeColor === '#111827' || strokeColor === '#000000')
      ? '#F8FAFC'
      : strokeColor;

    engineRef.current?.setTool(activeTool, {
      color: effectiveColor,
      width: strokeWidth,
      shapeKind: activeShapeKind,
    });
  }, [activeTool, strokeColor, strokeWidth, activeShapeKind, theme]);

  // Sync hand raised state to Awareness
  useEffect(() => {
    collabRef.current?.broadcastHandRaised(isHandRaised);
  }, [isHandRaised]);

  // Page Navigation Handlers
  const handlePrevPage = useCallback(() => {
    if (currentPageIndex > 1) {
      setCurrentPageIndex((i) => i - 1);
    }
  }, [currentPageIndex]);

  const handleNextPage = useCallback(() => {
    if (currentPageIndex < pages.length) {
      setCurrentPageIndex((i) => i + 1);
    }
  }, [currentPageIndex, pages.length]);

  const handleAddPage = useCallback(() => {
    const newPageNum = pages.length + 1;
    const newPage: PageMeta = {
      id: `page_${newPageNum}_${Date.now()}`,
      index: `a${newPageNum}`,
      kind: 'shared',
      title: `Page ${newPageNum}`,
      background: { type: 'grid', color: '#FFFFFF', spacing: 30 },
    };
    setPages((prev) => [...prev, newPage]);
    setCurrentPageIndex(newPageNum);
  }, [pages.length]);

  // Undo / Redo Handlers
  const handleUndo = useCallback(() => {
    if (!collabRef.current) return;
    const mgr = collabRef.current.getOrCreatePageManager(activePage.id);
    mgr.undo();
    engineRef.current?.setElements(mgr.getAllElements());
    setCanUndo(mgr.canUndo());
    setCanRedo(mgr.canRedo());
  }, [activePage.id]);

  const handleRedo = useCallback(() => {
    if (!collabRef.current) return;
    const mgr = collabRef.current.getOrCreatePageManager(activePage.id);
    mgr.redo();
    engineRef.current?.setElements(mgr.getAllElements());
    setCanUndo(mgr.canUndo());
    setCanRedo(mgr.canRedo());
  }, [activePage.id]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const store = useUIStore.getState();
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          store.setTool('select');
          break;
        case 'p':
          store.setTool('pen');
          break;
        case 'h':
          store.setTool('highlighter');
          break;
        case 'e':
          store.setTool('eraser');
          break;
        case 'r':
          store.setShapeKind('rect');
          break;
        case 'o':
          store.setShapeKind('ellipse');
          break;
        case 'l':
          store.setShapeKind('line');
          break;
        case 't':
          store.setTool('text');
          break;
        case 'x':
          store.setTool('laser');
          break;
        case 'pageup':
          handlePrevPage();
          break;
        case 'pagedown':
          handleNextPage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handlePrevPage, handleNextPage]);

  // Export handlers
  const handleExportPng = () => {
    if (!engineRef.current) return;
    const dataUrl = engineRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `inkroom-${title.replace(/\s+/g, '-').toLowerCase()}-page-${currentPageIndex}.png`;
    a.click();
  };

  const handleExportSvg = () => {
    if (!collabRef.current) return;
    const mgr = collabRef.current.getOrCreatePageManager(activePage.id);
    const elements = mgr.getAllElements();
    const svgStr = exportPageToSvg(elements, activePage);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inkroom-${title.replace(/\s+/g, '-').toLowerCase()}-page-${currentPageIndex}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportInkroom = () => {
    if (!collabRef.current) return;
    const pagesData = pages.map((p) => {
      const mgr = collabRef.current!.getOrCreatePageManager(p.id);
      return {
        pageMeta: p,
        elements: mgr.getAllElements(),
      };
    });

    const bundleStr = serializeInkroomBundle({
      version: '1.0',
      generator: 'Inkroom Whiteboard',
      createdAt: Date.now(),
      meta: {
        id: boardId,
        title,
        roomCode,
        createdAt: Date.now(),
        mode,
        settings: {
          studentsCanUndoOthers: false,
          allowStudentImages: true,
          maxElementsPerPage: 20000,
        },
      },
      pages: pagesData,
    });

    const blob = new Blob([bundleStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lesson-${title.replace(/\s+/g, '-').toLowerCase()}.inkroom`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`fixed inset-0 overflow-hidden flex flex-col ${theme === 'dark' ? 'theme-dark dark' : theme === 'blackboard' ? 'theme-blackboard' : ''}`}>
      {/* Top Bar Navigation */}
      <TopBar
        title={title}
        onTitleChange={setTitle}
        pageIndex={currentPageIndex}
        totalPages={pages.length}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        role={role}
        mode={mode}
        onModeChange={setMode}
        participantCount={participants.length}
        handRaisedCount={participants.filter((p) => p.handRaised).length}
        roomCode={roomCode}
      />

      {/* Non-blocking Offline / Reconnect Banner */}
      <ReconnectBanner status={connStatus} />

      {/* Whiteboard Interactive Canvas Area */}
      <main className="flex-1 relative overflow-hidden">
        {/* Floating Tool Dock */}
        <ToolDock
          canDraw={role === 'teacher' || mode === 'collaborate'}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        {/* Full-screen Konva Canvas Root */}
        <div
          ref={canvasContainerRef}
          className="absolute inset-0 cursor-crosshair"
          style={{
            backgroundColor: theme === 'blackboard' ? '#1B3B2B' : theme === 'dark' ? '#0B0F19' : '#FFFFFF',
          }}
        />

        {/* Collapsible Drawers & Modals */}
        <PageStrip
          pages={pages}
          activePageId={activePage.id}
          onSelectPage={(id) => {
            const idx = pages.findIndex((p) => p.id === id);
            if (idx !== -1) setCurrentPageIndex(idx + 1);
          }}
          onAddPage={handleAddPage}
          onDeletePage={(id) => {
            if (pages.length <= 1) return;
            setPages((prev) => prev.filter((p) => p.id !== id));
            setCurrentPageIndex(1);
          }}
          onChangeBackground={(id, bg) => {
            setPages((prev) =>
              prev.map((p) => (p.id === id ? { ...p, background: bg } : p))
            );
          }}
        />

        <ParticipantsPanel
          participants={participants}
          currentRole={role}
          onClearParticipantStrokes={(id) => {
            // Teacher moderation: clear elements by participant
            if (!collabRef.current) return;
            const mgr = collabRef.current.getOrCreatePageManager(activePage.id);
            const all = mgr.getAllElements();
            for (const el of all) {
              if (el.author === id) {
                mgr.deleteElement(el.id);
              }
            }
          }}
        />

        <ShareModal
          roomCode={roomCode}
          boardId={boardId}
          teacherSecret={teacherSecret}
        />

        <ExportModal
          onExportPng={handleExportPng}
          onExportSvg={handleExportSvg}
          onExportInkroom={handleExportInkroom}
        />
      </main>
    </div>
  );
}
