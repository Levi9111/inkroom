# Inkroom System Architecture

Inkroom is a free, open-source, real-time classroom whiteboard engineered with the **MERN** stack (MongoDB, Express, React, Node.js) with TypeScript end to end, using **Yjs** CRDT and **Hocuspocus** for multiplayer synchronization.

## 1. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                               Client (PWA)                                 │
│                                                                            │
│  React UI chrome (toolbar, panels, dialogs)       Zustand (UI state only)  │
│            │                                              │                │
│            ▼                                              ▼                │
│  ┌───────────────────────────────┐        ┌──────────────────────────────┐ │
│  │  Canvas Engine (imperative)   │◄──────►│  Document Layer (packages/   │ │
│  │  Konva stage                  │        │  core)                       │ │
│  │   ├─ Static layer (cached)    │        │   Y.Doc per page + meta doc  │ │
│  │   ├─ Active layer (live ink)  │        │   Y.UndoManager (local)      │ │
│  │   └─ UI layer (selection,     │        │   rbush spatial index        │ │
│  │      cursors, laser)          │        │   y-indexeddb (offline)      │ │
│  └───────────────────────────────┘        └──────────────┬───────────────┘ │
└──────────────────────────────────────────────────────────┼─────────────────┘
                                   WebSocket (Yjs + Awareness)│  HTTPS (REST)
┌──────────────────────────────────────────────────────────┼─────────────────┐
│                               Server                      ▼                 │
│  ┌──────────────────────────────────┐   ┌──────────────────────────────┐   │
│  │ Hocuspocus (on Express server)   │   │ Express REST API             │   │
│  │  onAuthenticate (JWT, role)      │   │  /boards  /join  /assets     │   │
│  │  per-document permissions        │   │  /export (optional)          │   │
│  │  persistence extension           │   │  rate limiting, validation   │   │
│  └───────────────┬──────────────────┘   └───────────────┬──────────────┘   │
│                  ▼                                       ▼                  │
│        Storage adapter                         Asset storage adapter        │
│        MongoDB (Mongoose)                      Local disk │ S3/R2/MinIO     │
└────────────────────────────────────────────────────────────────────────────┘
```

## 2. Core Design Principles

1. **Strict Separation of Concerns**:
   - **Document State**: Lives exclusively in Yjs CRDTs.
   - **UI State**: Lives in Zustand (active tool, selected color, zoom level, open modals). Never pollute document state with UI transient state.
   - **REST Data**: Managed via TanStack Query.
2. **Three-Layer Canvas Rendering**:
   - **Static Layer**: Cached vector shapes and rasterized static bounds culled with the `rbush` 2D spatial index.
   - **Active Layer**: Uncommitted high-speed local freehand ink powered by `perfect-freehand` with sub-16ms latency.
   - **UI Overlay Layer**: Bounding boxes, transform handles, live remote cursors, remote draft strokes, and ephemeral laser trails.
3. **Document-per-Page Multiplexing**:
   - Instead of a single giant monolithic CRDT, boards are partitioned into `board:<id>:meta` and `board:<id>:page:<pageId>`.
   - Pages are lazy-loaded on demand.
   - Per-student private pages can be granted granular write permissions.
4. **Local-First & Offline Resilience**:
   - Local state is persisted into IndexedDB via `y-indexeddb`.
   - When connection drops, editing continues uninterrupted and gracefully reconciles upon reconnect.
5. **MongoDB Persistence & BSON Mitigation**:
   - Yjs binary states are debounced (2s inactive, max 10s).
   - Points are simplified via Ramer-Douglas-Peucker (RDP) algorithm and delta-quantized.
   - When states exceed threshold, chunking or GridFS storage adapters are activated automatically.
