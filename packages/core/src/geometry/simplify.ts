/**
 * Ramer-Douglas-Peucker (RDP) algorithm for simplifying freehand stroke points.
 * Points are stored as flat tuples of 3 numbers: [x, y, pressure, x, y, pressure, ...]
 */

function perpendicularDistanceSquared(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    const diffX = px - x1;
    const diffY = py - y1;
    return diffX * diffX + diffY * diffY;
  }

  const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
  const clampedT = Math.max(0, Math.min(1, t));

  const projX = x1 + clampedT * dx;
  const projY = y1 + clampedT * dy;

  const diffX = px - projX;
  const diffY = py - projY;

  return diffX * diffX + diffY * diffY;
}

export function simplifyStrokePoints(points: number[], epsilon = 1.0): number[] {
  const pointCount = points.length / 3;
  if (pointCount <= 2) return [...points];

  const epsilonSq = epsilon * epsilon;
  const keep = new Uint8Array(pointCount);
  keep[0] = 1;
  keep[pointCount - 1] = 1;

  const stack: [number, number][] = [[0, pointCount - 1]];

  while (stack.length > 0) {
    const [startIndex, endIndex] = stack.pop()!;
    let maxDistSq = 0;
    let maxIndex = startIndex;

    const x1 = points[startIndex * 3];
    const y1 = points[startIndex * 3 + 1];
    const x2 = points[endIndex * 3];
    const y2 = points[endIndex * 3 + 1];

    for (let i = startIndex + 1; i < endIndex; i++) {
      const px = points[i * 3];
      const py = points[i * 3 + 1];

      const distSq = perpendicularDistanceSquared(px, py, x1, y1, x2, y2);
      if (distSq > maxDistSq) {
        maxDistSq = distSq;
        maxIndex = i;
      }
    }

    if (maxDistSq > epsilonSq) {
      keep[maxIndex] = 1;
      if (maxIndex - startIndex > 1) {
        stack.push([startIndex, maxIndex]);
      }
      if (endIndex - maxIndex > 1) {
        stack.push([maxIndex, endIndex]);
      }
    }
  }

  const result: number[] = [];
  for (let i = 0; i < pointCount; i++) {
    if (keep[i]) {
      result.push(points[i * 3], points[i * 3 + 1], points[i * 3 + 2]);
    }
  }

  return result;
}
