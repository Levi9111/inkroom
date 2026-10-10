# ADR 0013: MERN + TypeScript Across All Packages

## Status
Accepted

## Context
Choosing the foundational technology stack for Inkroom v1.2.

## Decision
Adopt the **MERN** stack (MongoDB, Express, React, Node.js) with TypeScript strict mode end-to-end.

## Rationale
- One unified language (TypeScript) and ecosystem across browser client, backend server, CRDT engine, and shared packages.
- Express 5 provides robust routing, WebSocket upgrade integration, and battle-tested middleware ecosystem (`helmet`, `cors`, `multer`, `sharp`).
- MongoDB 7+ via Mongoose 8 natively stores hierarchical board models and binary CRDT states, while TTL indexes automate 30-day session cleanup.
- Standard MERN knowledge maximizes contributor accessibility and project longevity.
