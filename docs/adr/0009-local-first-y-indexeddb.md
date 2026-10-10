# ADR 0009: Local-First Persistence with y-indexeddb

## Status
Accepted

## Context
Classroom Wi-Fi networks are notoriously unreliable. A temporary network drop must never cause loss of teacher lectures or student work.

## Decision
Integrate `y-indexeddb` as a local persistence layer on the client. All local updates commit immediately to IndexedDB and sync asynchronously when the WebSocket connection is established.

## Rationale
- Instant board loads from local disk on reload.
- Full offline capability for lesson preparation.
- Automatic CRDT delta reconciliation when the network reconnects.
