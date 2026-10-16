import type { Shape } from '@inkroom/shared';
import type { BoundingBox } from './bbox';
import { distanceToSegment, distanceBetweenPoints } from './distance';

export function lineSegmentsIntersect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
): boolean {
  const ccw = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => {
    return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
  };

  return (
    ccw(x1, y1, x3, y3, x4, y4) !== ccw(x2, y2, x3, y3, x4, y4) &&
    ccw(x1, y1, x2, y2, x3, y3) !== ccw(x1, y1, x2, y2, x4, y4)
  );
}

export function doesEraserIntersectStroke(
  eraserPoint: { x: number; y: number; radius: number },
  strokeOrigin: { x: number; y: number },
  strokePoints: number[],
  strokeWidth: number
): boolean {
  const threshold = eraserPoint.radius + strokeWidth / 2;
  const numPoints = Math.floor(strokePoints.length / 3);

  if (numPoints <= 0) return false;

  // Single-point strokes (dots / taps)
  if (numPoints === 1) {
    const px = strokeOrigin.x + strokePoints[0];
    const py = strokeOrigin.y + strokePoints[1];
    return distanceBetweenPoints(eraserPoint.x, eraserPoint.y, px, py) <= threshold;
  }

  for (let i = 0; i < numPoints - 1; i++) {
    const x1 = strokeOrigin.x + strokePoints[i * 3];
    const y1 = strokeOrigin.y + strokePoints[i * 3 + 1];
    const x2 = strokeOrigin.x + strokePoints[(i + 1) * 3];
    const y2 = strokeOrigin.y + strokePoints[(i + 1) * 3 + 1];

    const dist = distanceToSegment(eraserPoint.x, eraserPoint.y, x1, y1, x2, y2);
    if (dist <= threshold) {
      return true;
    }
  }

  return false;
}

export function doesEraserIntersectShape(
  eraserPoint: { x: number; y: number; radius: number },
  shape: Shape
): boolean {
  const threshold = eraserPoint.radius + shape.strokeWidth / 2;

  if (shape.kind === 'line' || shape.kind === 'arrow') {
    const x1 = shape.x;
    const y1 = shape.y;
    const x2 = shape.x + shape.width;
    const y2 = shape.y + shape.height;
    return distanceToSegment(eraserPoint.x, eraserPoint.y, x1, y1, x2, y2) <= threshold;
  }

  // Rect or Ellipse bounds
  const minX = Math.min(shape.x, shape.x + shape.width);
  const maxX = Math.max(shape.x, shape.x + shape.width);
  const minY = Math.min(shape.y, shape.y + shape.height);
  const maxY = Math.max(shape.y, shape.y + shape.height);

  const closestX = Math.max(minX, Math.min(eraserPoint.x, maxX));
  const closestY = Math.max(minY, Math.min(eraserPoint.y, maxY));
  const dx = eraserPoint.x - closestX;
  const dy = eraserPoint.y - closestY;

  return (dx * dx + dy * dy) <= threshold * threshold;
}

export function doesEraserIntersectBox(
  eraserPoint: { x: number; y: number; radius: number },
  box: BoundingBox
): boolean {
  const closestX = Math.max(box.minX, Math.min(eraserPoint.x, box.maxX));
  const closestY = Math.max(box.minY, Math.min(eraserPoint.y, box.maxY));
  const dx = eraserPoint.x - closestX;
  const dy = eraserPoint.y - closestY;

  return (dx * dx + dy * dy) <= eraserPoint.radius * eraserPoint.radius;
}
