import { describe, it, expect } from 'vitest';
import type { Stroke } from '@inkroom/shared';
import { sliceStrokeWithEraser } from '../src/geometry/slice';

describe('sliceStrokeWithEraser', () => {
  const baseStroke: Stroke = {
    id: 'stroke_test',
    type: 'stroke',
    tool: 'pen',
    color: '#000000',
    size: 2,
    opacity: 1,
    x: 0,
    y: 0,
    rotation: 0,
    z: 'a0',
    author: 'u1',
    createdAt: 1000,
    points: [0, 0, 0.5, 100, 0, 0.5],
  };

  it('returns original stroke if eraser does not intersect', () => {
    const eraser = { x: 50, y: 100, radius: 10 };
    const res = sliceStrokeWithEraser(eraser, baseStroke);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe(baseStroke.id);
  });

  it('slices a line in the middle into two sub-strokes', () => {
    const eraser = { x: 50, y: 0, radius: 10 };
    const res = sliceStrokeWithEraser(eraser, baseStroke);
    expect(res).toHaveLength(2);
    // First sub-stroke ends near x = 39 (50 - 11)
    const stroke1 = res[0];
    expect(stroke1.points[0]).toBe(0);
    expect(stroke1.points[1]).toBe(0);
    const lastX1 = stroke1.points[stroke1.points.length - 3];
    expect(lastX1).toBeLessThan(45);
    expect(lastX1).toBeGreaterThan(35);

    // Second sub-stroke starts near x = 61 (50 + 11)
    const stroke2 = res[1];
    const firstX2 = stroke2.points[0];
    expect(firstX2).toBeGreaterThan(55);
    expect(firstX2).toBeLessThan(65);
    const lastX2 = stroke2.points[stroke2.points.length - 3];
    expect(lastX2).toBe(100);
  });

  it('trims the end of a line', () => {
    const eraser = { x: 95, y: 0, radius: 10 };
    const res = sliceStrokeWithEraser(eraser, baseStroke);
    expect(res).toHaveLength(1);
    const trimmed = res[0];
    expect(trimmed.points[0]).toBe(0);
    const lastX = trimmed.points[trimmed.points.length - 3];
    expect(lastX).toBeLessThan(90);
    expect(lastX).toBeGreaterThan(80);
  });

  it('completely deletes a stroke if the eraser covers it', () => {
    const eraser = { x: 50, y: 0, radius: 100 };
    const res = sliceStrokeWithEraser(eraser, baseStroke);
    expect(res).toHaveLength(0);
  });

  it('erases a single-point dot stroke', () => {
    const dotStroke: Stroke = {
      ...baseStroke,
      id: 'dot_1',
      points: [10, 10, 0.5],
    };
    const eraserHit = { x: 10, y: 10, radius: 5 };
    expect(sliceStrokeWithEraser(eraserHit, dotStroke)).toHaveLength(0);

    const eraserMiss = { x: 50, y: 50, radius: 5 };
    expect(sliceStrokeWithEraser(eraserMiss, dotStroke)).toHaveLength(1);
  });
});
