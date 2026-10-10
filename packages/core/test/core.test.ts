import { describe, it, expect } from 'vitest';
import { simplifyStrokePoints } from '../src/geometry/simplify';
import { CanvasSpatialIndex } from '../src/spatial/spatial-index';
import { generateInitialKey, generateKeyBetween } from '../src/indexing/fractional-index';
import { PageDocManager } from '../src/doc/doc-manager';
import type { Stroke } from '@inkroom/shared';

describe('Ramer-Douglas-Peucker Simplification', () => {
  it('simplifies colinear points into endpoints', () => {
    // 5 points along a straight line: (0,0), (2,2), (4,4), (6,6), (8,8)
    const points = [0, 0, 0.5, 2, 2, 0.5, 4, 4, 0.5, 6, 6, 0.5, 8, 8, 0.5];
    const simplified = simplifyStrokePoints(points, 0.1);
    expect(simplified.length / 3).toBe(2);
    expect(simplified[0]).toBe(0);
    expect(simplified[1]).toBe(0);
    expect(simplified[3]).toBe(8);
    expect(simplified[4]).toBe(8);
  });
});

describe('Spatial Index (RBush)', () => {
  it('indexes and queries elements by viewport bounds', () => {
    const index = new CanvasSpatialIndex();
    const stroke1: Stroke = {
      id: 'stroke_1',
      type: 'stroke',
      tool: 'pen',
      color: '#000000',
      size: 2,
      opacity: 1,
      x: 0,
      y: 0,
      z: 'a0',
      author: 'u1',
      createdAt: 1,
      points: [0, 0, 0.5, 10, 10, 0.5],
    };
    const stroke2: Stroke = {
      id: 'stroke_2',
      type: 'stroke',
      tool: 'pen',
      color: '#000000',
      size: 2,
      opacity: 1,
      x: 500,
      y: 500,
      z: 'a1',
      author: 'u1',
      createdAt: 2,
      points: [0, 0, 0.5, 10, 10, 0.5],
    };

    index.insert(stroke1);
    index.insert(stroke2);

    const hits1 = index.queryPoint(5, 5, 20);
    expect(hits1).toContain('stroke_1');
    expect(hits1).not.toContain('stroke_2');

    const hits2 = index.queryPoint(505, 505, 20);
    expect(hits2).toContain('stroke_2');
    expect(hits2).not.toContain('stroke_1');
  });
});

describe('Fractional Indexing', () => {
  it('generates sequential and interpolated keys', () => {
    const k0 = generateInitialKey();
    const k1 = generateKeyBetween(k0, null);
    expect(k0 < k1).toBe(true);

    const kBetween = generateKeyBetween(k0, k1);
    expect(k0 < kBetween).toBe(true);
    expect(kBetween < k1).toBe(true);
  });
});

describe('Scoped Y.UndoManager', () => {
  it('isolates local-origin transactions for undo/redo', () => {
    const manager = new PageDocManager();
    const el1: Stroke = {
      id: 's1',
      type: 'stroke',
      tool: 'pen',
      color: '#ff0000',
      size: 4,
      opacity: 1,
      x: 0,
      y: 0,
      z: 'a0',
      author: 'u1',
      createdAt: 1,
      points: [0, 0, 0.5],
    };

    manager.setElement(el1);
    expect(manager.getElement('s1')).toBeDefined();
    expect(manager.canUndo()).toBe(true);

    manager.undo();
    expect(manager.getElement('s1')).toBeUndefined();
    expect(manager.canRedo()).toBe(true);

    manager.redo();
    expect(manager.getElement('s1')).toBeDefined();
  });
});
