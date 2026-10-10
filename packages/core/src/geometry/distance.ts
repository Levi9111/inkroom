export function distanceBetweenPoints(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return distanceBetweenPoints(px, py, x1, y1);
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return distanceBetweenPoints(px, py, projX, projY);
}

export function distanceToPolyline(px: number, py: number, points: number[], stride = 3): number {
  if (points.length < stride) return Infinity;
  if (points.length === stride) {
    return distanceBetweenPoints(px, py, points[0], points[1]);
  }

  let minDistance = Infinity;
  const numPoints = points.length / stride;

  for (let i = 0; i < numPoints - 1; i++) {
    const x1 = points[i * stride];
    const y1 = points[i * stride + 1];
    const x2 = points[(i + 1) * stride];
    const y2 = points[(i + 1) * stride + 1];

    const d = distanceToSegment(px, py, x1, y1, x2, y2);
    if (d < minDistance) {
      minDistance = d;
    }
  }

  return minDistance;
}
