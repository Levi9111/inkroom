# ADR 0003: `perfect-freehand` for Stroke Outlines and Pointer Events with Coalesced Events

## Status
Accepted

## Context
Standard HTML5 canvas lines with tension smoothing lack natural pressure dynamics and feel unnatural with hardware styluses (Apple Pencil, S-Pen, Surface Pen).

## Decision
Adopt `perfect-freehand` to compute variable-width polygon contours based on pointer pressure, velocity, and smoothing parameters. Capture pointer events using `e.getCoalescedEvents()` with hardware palm rejection.

## Rationale
- Sub-16ms drawing feedback with fluid calligraphy and ink dynamics.
- Pointer coalescing ensures fine curves are captured even during high-velocity handwriting strokes.
