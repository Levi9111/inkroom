<div align="center">

# 🖋️ Inkroom

### *Write together. Teach anywhere.*

An open-source, local-first, real-time classroom whiteboard built on the **MERN** stack with TypeScript and **Yjs** CRDTs.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node: 22+](https://img.shields.io/badge/Node.js-v22%20LTS-green.svg)](https://nodejs.org/)
[![Stack: MERN](https://img.shields.io/badge/Stack-MERN-purple.svg)](https://www.mongodb.com/mern-stack)
[![CRDT: Yjs](https://img.shields.io/badge/Sync-Yjs%20%2B%20Hocuspocus-orange.svg)](https://yjs.dev/)
[![Docker: Ready](https://img.shields.io/badge/Docker-One--Command-2496ED.svg)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#-features) • [Architecture](#-architecture) • [Quickstart](#-quickstart) • [Self-Hosting](#-self-hosting) • [Keyboard Shortcuts](#-keyboard-shortcuts) • [Documentation](#-documentation)

---

</div>

## 🌟 Vision

A whiteboard that a teacher can open and start teaching on within **30 seconds**, that students can join **without an account**, and that any school or university can self-host for free.

## ✨ Features

- **⚡ Sub-16ms Handwriting Feedback**: Powered by `perfect-freehand` with pressure dynamics, hardware palm rejection, and coalesced pointer event smoothing.
- **🔄 Local-First & Resilient**: Edits commit locally to `IndexedDB` first. Lessons continue uninterrupted on unstable school Wi-Fi and sync smoothly when reconnected.
- **🛡️ Classroom Roles & Permissions**:
  - **Present Mode**: View only; students follow teacher navigation.
  - **Collaborate Mode**: Real-time group drawing with per-participant soft attribution.
  - **Individual Mode**: Private student pages; teacher has bird's-eye gallery overview.
  - **Locked Mode**: Freezes the canvas for discussions.
- **🔒 Privacy by Default**: Zero student account requirements, no tracking pixels, ephemeral room codes, and teacher control tokens placed in URL hash fragments (`#secret`).
- **📑 Multi-Page Boards & Backgrounds**: Seamless slide sequences with lined, graph, grid, dot, and blackboard backgrounds.
- **🎨 Projector-Tuned Colors**: High-contrast swatches optimized for school projectors and ambient room lighting.
- **📦 Multi-Format Export**: One-click export to high-res PNG, standalone scalable SVG (directly from data model), and `.inkroom` project bundles.
- **🐳 One-Command Self-Hosting**: Deploy in seconds using Docker Compose with zero vendor lock-in.

---

## 🏗️ Architecture

Inkroom is organized as a unified monorepo managed with **pnpm** and **Turborepo**:

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

### Monorepo Structure

```
inkroom/
├── apps/
│   ├── web/          # Vite + React 18+ SPA (Canvas client)
│   └── server/       # Express + Hocuspocus collaboration backend
├── packages/
│   ├── core/         # Headless geometry, spatial culling, ink pipeline, exporters
│   ├── ui/           # Radix-based accessible UI components & design system
│   └── shared/       # Shared TypeScript types, zod schemas, constants & permissions
├── docs/             # Architecture Decision Records (ADR 01-13) & guides
├── docker/           # Production container configurations
└── e2e/              # Playwright multi-client integration tests
```

---

## 🚀 Quickstart

### Prerequisites

- [Node.js](https://nodejs.org/) v20+ (v22 LTS recommended)
- [pnpm](https://pnpm.io/) v9+ or v11+ (`npm install -g pnpm`)

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/Levi9111/inkroom.git
cd inkroom

# Install dependencies across all workspace packages
pnpm install

# Start both web client and collaboration server concurrently
pnpm dev
```

- **Web Client**: [http://localhost:5173](http://localhost:5173)
- **API Server & Docs**: [http://localhost:8080](http://localhost:8080) / [http://localhost:8080/docs](http://localhost:8080/docs)

---

## 🐳 Self-Hosting

Deploy your own private school or campus instance in one command:

```yaml
# docker-compose.yml
version: '3.8'

services:
  inkroom:
    image: ghcr.io/levi9111/inkroom:latest
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - MONGODB_URI=mongodb://mongo:27017/inkroom
      - JWT_SECRET=change-this-to-a-very-secure-random-secret
      - ALLOWED_ORIGINS=http://localhost:8080,https://board.myschool.edu
    volumes:
      - inkroom-uploads:/app/uploads
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    volumes:
      - inkroom-db:/data/db
    restart: unless-stopped

volumes:
  inkroom-uploads:
  inkroom-db:
```

```bash
docker compose up -d
```

Detailed deployment configurations (NGINX, Caddy, SSL, and S3 asset adapters) can be found in [`docs/self-hosting.md`](docs/self-hosting.md).

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Shortcut | Action |
|---|---|---|---|
| <kbd>V</kbd> | Selection Tool | <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Z</kbd> | Undo (Local only) |
| <kbd>P</kbd> | Pen Tool | <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Y</kbd> | Redo |
| <kbd>H</kbd> | Highlighter | <kbd>PageUp</kbd> | Previous Page |
| <kbd>E</kbd> | Stroke Eraser | <kbd>PageDown</kbd> | Next Page |
| <kbd>R</kbd> | Rectangle Shape | <kbd>Ctrl</kbd> + Scroll | Zoom in/out |
| <kbd>O</kbd> | Ellipse Shape | <kbd>Space</kbd> + Drag | Pan Canvas |
| <kbd>L</kbd> / <kbd>A</kbd> | Line / Arrow | <kbd>T</kbd> | Text Tool |
| <kbd>X</kbd> | Laser Pointer | <kbd>?</kbd> | Shortcuts Help |

---

## 📚 Documentation

- [System Architecture](docs/architecture.md)
- [Architecture Decision Records (ADRs)](docs/adr/)
- [Self-Hosting Guide](docs/self-hosting.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)

---

## 🤝 Contributing

We welcome contributions from educators, designers, and software engineers worldwide! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## 📄 License

Inkroom is 100% free and open-source software licensed under the [MIT License](LICENSE).
