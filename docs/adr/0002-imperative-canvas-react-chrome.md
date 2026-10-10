# ADR 0002: Imperative Konva for Canvas, React Only for UI Chrome

## Status
Accepted

## Context
Declarative canvas bindings like `react-konva` reconcile virtual DOM nodes for every stroke and point modification. In a high-throughput handwriting session with 5,000+ points and dozens of strokes per minute, React reconciliation creates garbage-collection pauses and dropped frames.

## Decision
Keep React strictly for UI chrome (toolbars, dialogs, page navigator, participants drawer). Manage the Konva stage imperatively through a dedicated canvas engine controller.

## Rationale
- Zero React overhead during active drawing and high-frequency pointer event loops.
- Granular control over stage layer caching, dirty-rect invalidation, and custom batch rendering passes.
