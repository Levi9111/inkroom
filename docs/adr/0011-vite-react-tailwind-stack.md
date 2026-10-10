# ADR 0011: UI Stack: Vite, React 18+, Tailwind, Radix UI, Zustand, TanStack Query

## Status
Accepted

## Context
Choosing the client presentation layer stack.

## Decision
- **Vite + React 18+**: Fast hot-module-reloading and lightweight SPA bundle.
- **Tailwind CSS**: Rapid utility-first styling adhering to classroom design tokens.
- **Radix UI Primitives**: Accessible, unstyled UI primitives (popovers, dialogs, toolbars, sliders).
- **Zustand**: Minimalist store strictly for UI chrome state.
- **TanStack Query**: Declarative server-state caching for REST endpoints.

## Rationale
Ensures 60fps canvas performance by avoiding unnecessary React state re-renders and keeping canvas logic detached from React life cycles.
