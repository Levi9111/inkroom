export function getSvgPathFromStroke(strokePoints: [number, number][], closed = true): string {
  const len = strokePoints.length;
  if (len < 4) return '';

  let a = strokePoints[0];
  let b = strokePoints[1];
  const c = strokePoints[2];

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${((b[0] + c[0]) / 2).toFixed(2)},${((b[1] + c[1]) / 2).toFixed(2)}`;

  for (let i = 2; i < len - 1; i++) {
    a = strokePoints[i];
    b = strokePoints[i + 1];
    result += ` Q${a[0].toFixed(2)},${a[1].toFixed(2)} ${((a[0] + b[0]) / 2).toFixed(2)},${((a[1] + b[1]) / 2).toFixed(2)}`;
  }

  if (closed) {
    result += ' Z';
  }

  return result;
}
