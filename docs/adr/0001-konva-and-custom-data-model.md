# ADR 0001: Build on Konva with Own Data Model

## Status
Accepted

## Context
When building a collaborative educational whiteboard, we evaluated three foundational options:
1. Forking Excalidraw.
2. Using the tldraw SDK.
3. Building a custom canvas renderer on top of Konva with a dedicated whiteboard data model.

## Decision
We decided to build on Konva with an independent, classroom-focused data model.

## Rationale
- **Product Identity & Classroom UX**: Excalidraw is heavily optimized around a hand-drawn rough aesthetic and flat board model. Classrooms require crisp lines, structured backgrounds (lined, graph, axes), slide/PDF pages, and teacher/student permission models.
- **License Certainty**: Third-party whiteboard SDKs often carry restrictive or non-commercial production licensing terms incompatible with pure MIT open-source distribution.
- **Data Model Independence**: Keeping our CRDT element schema decoupled from any UI framework gives total control over serialization, exports, and server validation.

## Consequences
- Requires implementing our own hit-testing, selection handles, and transform logic.
- Mitigated by using `rbush` for broad-phase bounding-box culling.
