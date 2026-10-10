# ADR 0004: Yjs Document-per-Page Architecture

## Status
Accepted

## Context
Educational boards often span multiple pages (10 to 50 pages for slide decks or lessons). Putting all pages into a single monolithic Yjs document leads to excessive initial download size, high memory consumption, and inability to enforce per-page permissions for student exercises.

## Decision
Split boards into:
1. `board:<id>:meta` - lightweight document containing board title, mode, page list, and global settings.
2. `board:<id>:page:<pageId>` - discrete Yjs document containing elements for that specific page.

## Rationale
- Lazy-loads pages only when navigated to.
- Enables granular permission enforcement (e.g. In Individual mode, a student only has write access to `board:<id>:page:student_<id>`).
- Significantly reduces client memory overhead and CRDT update payload sizes.
