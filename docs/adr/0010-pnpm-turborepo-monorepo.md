# ADR 0010: Monorepo with pnpm Workspaces and Turborepo

## Status
Accepted

## Context
Inkroom requires synchronized schemas, geometry algorithms, UI tokens, and communication protocols across frontend and backend services.

## Decision
Use a pnpm monorepo managed with Turborepo with packages:
- `apps/web`: Vite + React frontend client.
- `apps/server`: Express + Hocuspocus backend.
- `packages/core`: Headless whiteboard geometry, CRDT management, exporters.
- `packages/ui`: Design system tokens and Radix UI components.
- `packages/shared`: Shared TypeScript types, schemas, and permissions.

## Rationale
- Zero-cost cross-package code sharing with strict type safety.
- Turborepo parallelizes builds, lints, and test pipelines with intelligent caching.
