import type { Stroke } from '@inkroom/shared';
import { doesEraserIntersectStroke } from './intersection';

export interface SlicePoint {
  x: number;
  y: number;
  p: number;
}

/**
 * Slices a vector stroke with a circular eraser.
 * If the eraser intersects the stroke, points within the eraser radius are carved away,
 * returning the surviving contiguous sub-strokes.
 * If the entire stroke is erased, returns an empty array [].
 * If no intersection occurs, returns the original [stroke].
 */
export function sliceStrokeWithEraser(
  eraser: { x: number; y: number; radius: number },
  stroke: Stroke
): Stroke[] {
  const ox = stroke.x;
  const oy = stroke.y;
  const strokeWidth = stroke.size || 4;

  // Quick bounding / intersection test
  if (!doesEraserIntersectStroke(eraser, { x: ox, y: oy }, stroke.points, strokeWidth)) {
    return [stroke];
  }

  const stride = 3;
  const numPoints = Math.floor(stroke.points.length / stride);
  if (numPoints === 0) return [];

  // Effective cutting radius
  const R = eraser.radius + strokeWidth * 0.5;
  const Rsq = R * R;

  // Eraser center in stroke-local coordinates
  const cx = eraser.x - ox;
  const cy = eraser.y - oy;

  // Single-point dot stroke
  if (numPoints === 1) {
    const px = stroke.points[0];
    const py = stroke.points[1];
    const distSq = (px - cx) * (px - cx) + (py - cy) * (py - cy);
    return distSq <= Rsq ? [] : [stroke];
  }

  // Multi-point stroke: slice each segment against the circle
  const polylines: SlicePoint[][] = [];
  let currentPoly: SlicePoint[] | null = null;

  for (let i = 0; i < numPoints - 1; i++) {
    const p0: SlicePoint = {
      x: stroke.points[i * stride],
      y: stroke.points[i * stride + 1],
      p: stroke.points[i * stride + 2] ?? 0.5,
    };
    const p1: SlicePoint = {
      x: stroke.points[(i + 1) * stride],
      y: stroke.points[(i + 1) * stride + 1],
      p: stroke.points[(i + 1) * stride + 2] ?? 0.5,
    };

    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const fx = p0.x - cx;
    const fy = p0.y - cy;

    const a = dx * dx + dy * dy;
    if (a === 0) {
      // Degenerate segment
      const isOut = (p0.x - cx) * (p0.x - cx) + (p0.y - cy) * (p0.y - cy) > Rsq;
      if (isOut) {
        if (!currentPoly) {
          currentPoly = [p0];
        } else {
          currentPoly.push(p0);
        }
      } else if (currentPoly) {
        polylines.push(currentPoly);
        currentPoly = null;
      }
      continue;
    }

    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - Rsq;
    const disc = b * b - 4 * a * c;

    // Collect split parameters along the segment t in [0, 1]
    const tValues = [0, 1];
    if (disc > 0) {
      const sqrtDisc = Math.sqrt(disc);
      const t1 = (-b - sqrtDisc) / (2 * a);
      const t2 = (-b + sqrtDisc) / (2 * a);
      if (t1 > 0.0001 && t1 < 0.9999) tValues.push(t1);
      if (t2 > 0.0001 && t2 < 0.9999) tValues.push(t2);
    }

    tValues.sort((u, v) => u - v);

    // Filter duplicates
    const cleanT: number[] = [];
    for (const t of tValues) {
      if (cleanT.length === 0 || t - cleanT[cleanT.length - 1] > 1e-4) {
        cleanT.push(t);
      }
    }

    // Evaluate each sub-interval
    for (let k = 0; k < cleanT.length - 1; k++) {
      const tStart = cleanT[k];
      const tEnd = cleanT[k + 1];
      const tMid = (tStart + tEnd) / 2;

      const midX = p0.x + tMid * dx;
      const midY = p0.y + tMid * dy;
      const isOutside = (midX - cx) * (midX - cx) + (midY - cy) * (midY - cy) > Rsq;

      if (isOutside) {
        const ptA: SlicePoint = {
          x: p0.x + tStart * dx,
          y: p0.y + tStart * dy,
          p: p0.p + tStart * (p1.p - p0.p),
        };
        const ptB: SlicePoint = {
          x: p0.x + tEnd * dx,
          y: p0.y + tEnd * dy,
          p: p0.p + tEnd * (p1.p - p0.p),
        };

        if (!currentPoly) {
          currentPoly = [ptA, ptB];
        } else {
          const lastPt = currentPoly[currentPoly.length - 1];
          const distToLast = Math.hypot(ptA.x - lastPt.x, ptA.y - lastPt.y);
          if (distToLast > 0.5) {
            currentPoly.push(ptA);
          }
          currentPoly.push(ptB);
        }
      } else {
        if (currentPoly) {
          polylines.push(currentPoly);
          currentPoly = null;
        }
      }
    }
  }

  if (currentPoly) {
    polylines.push(currentPoly);
  }

  if (polylines.length === 0) {
    return [];
  }

  // Construct valid Stroke objects from surviving polylines
  const result: Stroke[] = [];
  for (const poly of polylines) {
    if (poly.length === 0) continue;

    let ptsArray: number[] = [];
    if (poly.length === 1) {
      // Synthesize minimal dot
      const pt = poly[0];
      ptsArray = [pt.x, pt.y, pt.p, pt.x + 0.5, pt.y + 0.5, pt.p];
    } else {
      // Filter out tiny microscopic residual segments (< 1.5px) if original was long
      let totalLength = 0;
      for (let j = 0; j < poly.length - 1; j++) {
        totalLength += Math.hypot(poly[j + 1].x - poly[j].x, poly[j + 1].y - poly[j].y);
      }
      if (totalLength < 1.5 && numPoints > 3) {
        continue;
      }

      for (const pt of poly) {
        ptsArray.push(pt.x, pt.y, pt.p);
      }
    }

    if (ptsArray.length >= 6) {
      result.push({
        ...stroke,
        id: 's_' + Math.random().toString(36).substring(2, 11),
        points: ptsArray,
        createdAt: Date.now(),
      });
    }
  }

  return result;
}
