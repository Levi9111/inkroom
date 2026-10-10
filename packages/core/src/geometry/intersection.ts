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
  const numPoints = strokePoints.length / 3;

  for (let i = 0; i < numPoints - 1; i++) {
    const x1 = strokeOrigin.x + strokePoints[i * 3];
    const y1 = strokeOrigin.y + strokePoints[i * 3 + 1];
    const x2 = strokeOrigin.x + strokePoints[(i + 1) * 3];
    const y2 = strokeOrigin.y + strokePoints[(i + 1) * 3 + 1];

    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;

    let dist = 0;
    if (lenSq === 0) {
      const px = eraserPoint.x - x1;
      const py = eraserPoint.y - y1;
      dist = Math.sqrt(px * px + py * py);
    } else {
      const t = Math.max(0, Math.min(1, ((eraserPoint.x - x1) * dx + (eraserPoint.y - y1) * dy) / lenSq));
      const projX = x1 + t * dx;
      const projY = y1 + t * dy;
      const px = eraserPoint.x - projX;
      const py = eraserPoint.y - projY;
      dist = Math.sqrt(px * px + py * py);
    }

    if (dist <= threshold) {
      return true;
    }
  }

  return false;
}
