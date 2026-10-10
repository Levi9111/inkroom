# ADR 0005: Express Server Hosting Hocuspocus with MongoDB Persistence

## Status
Accepted

## Context
Real-time sync requires an authoritative persistence backend and WebSocket relay. We evaluated Fastify + SQLite/Postgres vs. Express + Hocuspocus + MongoDB.

## Decision
Run Hocuspocus attached to an Express 5 HTTP server on Node.js, storing binary Yjs states and board metadata in MongoDB via Mongoose.

## Rationale
- Standard MERN stack architecture facilitates rapid development and community maintenance.
- Single database simplifies operational footprint while native TTL indexes handle board expiry effortlessly.
- Hocuspocus handles multiplexed Yjs protocol framing, awareness propagation, and persistence hooks with high reliability.
