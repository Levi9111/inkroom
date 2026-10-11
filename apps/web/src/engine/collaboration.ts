import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';
import type { CanvasElement, PageMeta, BoardMeta, AwarenessState, Role } from '@inkroom/shared';
import { PageDocManager, BoardMetaDocManager } from '@inkroom/core';

export interface CollaborationOptions {
  boardId: string;
  token?: string;
  userName: string;
  userRole: Role;
  userColor: string;
  serverUrl?: string;
  onConnectionStatusChange?: (status: 'connected' | 'connecting' | 'disconnected') => void;
  onRemoteCursorUpdate?: (user: { id: string; name: string; color: string; x: number; y: number }) => void;
  onRemoteCursorRemove?: (userId: string) => void;
  onAwarenessChange?: (states: AwarenessState[]) => void;
}

export class CollaborationClient {
  public readonly boardId: string;
  public readonly metaDocManager: BoardMetaDocManager;
  private pageManagers = new Map<string, PageDocManager>();
  private pageProviders = new Map<string, HocuspocusProvider>();
  private activePageId: string = 'page_1';

  private metaProvider: HocuspocusProvider | null = null;
  private activePageProvider: HocuspocusProvider | null = null;
  private indexedDbMeta: IndexeddbPersistence | null = null;

  private options: CollaborationOptions;
  private userId: string;

  constructor(options: CollaborationOptions) {
    this.options = options;
    this.boardId = options.boardId;
    this.userId = 'u_' + Math.random().toString(36).substring(2, 9);

    // Initialize meta doc
    this.metaDocManager = new BoardMetaDocManager();
    this.initMetaPersistence();
    this.connectMetaProvider();
  }

  private initMetaPersistence() {
    try {
      this.indexedDbMeta = new IndexeddbPersistence(`inkroom:${this.boardId}:meta`, this.metaDocManager.doc);
    } catch {
      console.warn('IndexedDB unavailable for meta persistence');
    }
  }

  private getWsUrl(): string {
    const envWs = (import.meta as any).env?.VITE_WS_URL || (import.meta as any).env?.VITE_SERVER_URL?.replace(/^http/, 'ws');
    if (this.options.serverUrl) return this.options.serverUrl;
    if (envWs) return envWs;

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return 'ws://localhost:8080';
    }

    return (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + `//${window.location.host}/ws`;
  }

  private connectMetaProvider() {
    const wsUrl = this.getWsUrl();

    this.metaProvider = new HocuspocusProvider({
      url: wsUrl,
      name: `board:${this.boardId}:meta`,
      document: this.metaDocManager.doc,
      token: this.options.token,
      onStatus: (event) => {
        this.options.onConnectionStatusChange?.(event.status);
      },
      onAwarenessUpdate: ({ states }) => {
        const awarenessList: AwarenessState[] = states
          .filter(Boolean)
          .map((s) => s as unknown as AwarenessState);
        this.options.onAwarenessChange?.(awarenessList);

        for (const s of awarenessList) {
          if (s?.user && s.user.id !== this.userId && s.cursor) {
            this.options.onRemoteCursorUpdate?.({
              id: s.user.id,
              name: s.user.name,
              color: s.user.color,
              x: s.cursor.x,
              y: s.cursor.y,
            });
          }
        }
      },
    });

    // Set local awareness
    this.metaProvider.setAwarenessField('user', {
      id: this.userId,
      name: this.options.userName,
      color: this.options.userColor,
      role: this.options.userRole,
    });
  }

  public getOrCreatePageManager(pageId: string): PageDocManager {
    let manager = this.pageManagers.get(pageId);
    if (!manager) {
      manager = new PageDocManager();
      this.pageManagers.set(pageId, manager);

      // IndexedDB persistence per page
      try {
        new IndexeddbPersistence(`inkroom:${this.boardId}:page:${pageId}`, manager.doc);
      } catch {
        // ignore
      }
    }
    return manager;
  }

  public setActivePage(pageId: string) {
    this.activePageId = pageId;
    const pageManager = this.getOrCreatePageManager(pageId);

    let provider = this.pageProviders.get(pageId);
    if (!provider) {
      const wsUrl = this.getWsUrl();
      provider = new HocuspocusProvider({
        url: wsUrl,
        name: `board:${this.boardId}:page:${pageId}`,
        document: pageManager.doc,
        token: this.options.token,
      });
      this.pageProviders.set(pageId, provider);
    }

    this.activePageProvider = provider;
    return pageManager;
  }

  public broadcastCursor(x: number, y: number) {
    this.metaProvider?.setAwarenessField('cursor', { x, y, pageId: this.activePageId });
  }

  public broadcastDraft(draft: { tool: string; color: string; size: number; points: number[] } | null) {
    this.metaProvider?.setAwarenessField('draft', draft);
  }

  public broadcastHandRaised(raised: boolean) {
    this.metaProvider?.setAwarenessField('handRaised', raised);
  }

  public destroy() {
    this.metaProvider?.destroy();
    this.pageProviders.forEach((p) => p.destroy());
    this.pageProviders.clear();
    this.activePageProvider = null;
    this.indexedDbMeta?.destroy();
  }
}

