import { describe, it, expect } from 'vitest';
import { distanceBetweenPoints, distanceToSegment, distanceToPolyline } from '../src/geometry/distance';
import { computeStrokeBounds, computeShapeBounds } from '../src/geometry/bbox';
import { doesEraserIntersectStroke } from '../src/geometry/intersection';
import type { Stroke } from '@inkroom/shared';

describe('Geometry Utilities', () => {
  it('calculates Euclidean distance between points', () => {
    expect(distanceBetweenPoints(0, 0, 3, 4)).toBe(5);
    expect(distanceBetweenPoints(1, 1, 1, 1)).toBe(0);
  });

  it('calculates perpendicular and endpoint distance to line segment', () => {
    // Point directly above segment midpoint
    expect(distanceToSegment(5, 5, 0, 0, 10, 0)).toBe(5);
    // Point past segment start
    expect(distanceToSegment(-3, 4, 0, 0, 10, 0)).toBe(5);
  });

  it('computes bounding box for stroke correctly', () => {
    const stroke: Stroke = {
      id: 'stroke_1',
      type: 'stroke',
      tool: 'pen',
      color: '#000000',
      size: 4,
      opacity: 1,
      x: 10,
      y: 20,
      z: 'a0',
      author: 'user_1',
      createdAt: 1000,
      points: [0, 0, 0.5, 10, 10, 0.5, 20, 0, 0.5],
    };

    const bbox = computeStrokeBounds(stroke);
    expect(bbox.minX).toBe(10 - 2); // 8
    expect(bbox.maxX).toBe(30 + 2); // 32
    expect(bbox.minY).toBe(20 - 2); // 18
    expect(bbox.maxY).toBe(30 + 2); // 32
    expect(bbox.width).toBe(24);
  });

  it('detects eraser intersection with multi-point and single-dot strokes', () => {
    // Multi-point stroke
    expect(
      doesEraserIntersectStroke(
        { x: 15, y: 25, radius: 10 },
        { x: 10, y: 20 },
        [0, 0, 0.5, 10, 10, 0.5],
        4
      )
    ).toBe(true);

    // Single-dot stroke (numPoints = 1)
    expect(
      doesEraserIntersectStroke(
        { x: 12, y: 22, radius: 5 },
        { x: 10, y: 20 },
        [0, 0, 0.5],
        4
      )
    ).toBe(true);

    // Far away stroke
    expect(
      doesEraserIntersectStroke(
        { x: 100, y: 100, radius: 5 },
        { x: 10, y: 20 },
        [0, 0, 0.5, 10, 10, 0.5],
        4
      )
    ).toBe(false);
  });

  it('computes shape bounds correctly even when dragged in reverse direction', () => {
    const shape = {
      id: 'sh_1',
      type: 'shape' as const,
      kind: 'rect' as const,
      x: 100,
      y: 100,
      width: -50,
      height: -30,
      stroke: '#000',
      strokeWidth: 2,
      fill: null,
      dash: 'solid' as const,
      rotation: 0,
      z: 'a0',
      author: 'u1',
      createdAt: 100,
    };
    const bounds = computeShapeBounds(shape);
    expect(bounds.minX).toBe(50);
    expect(bounds.maxX).toBe(100);
    expect(bounds.minY).toBe(70);
    expect(bounds.maxY).toBe(100);
    expect(bounds.width).toBe(50);
    expect(bounds.height).toBe(30);
  });
});
