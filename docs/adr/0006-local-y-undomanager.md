# ADR 0006: Local-Origin Scoped Y.UndoManager

## Status
Accepted

## Context
Standard UI undo managers (like Redux or Zustand history) track global state transitions. In a collaborative environment, triggering Undo with a global stack would inadvertently undo strokes made by other participants in the room.

## Decision
Use `Y.UndoManager` tied directly to each active page doc's elements collection, explicitly filtered to `trackedOrigins: [localOrigin]`.

## Rationale
- Each participant only undos and redos their own modifications.
- CRDT maintains deterministic convergence across all clients regardless of the order or interleaving of undo operations.
