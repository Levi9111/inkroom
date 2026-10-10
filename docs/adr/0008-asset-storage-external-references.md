# ADR 0008: Asset Storage External References

## Status
Accepted

## Context
Storing embedded base64 image data directly within CRDT documents leads to extreme memory bloat, high serialization latency, and sluggish network synchronization.

## Decision
Upload images and PDF page assets to object storage (local disk directory or S3-compatible bucket). Store only immutable asset IDs and dimensional metadata in the Yjs CRDT element schema.

## Rationale
- Keeps Yjs binary updates tiny and fast.
- Enables browser caching and CDNs for raster assets.
- Prevents CRDT state explosion.
