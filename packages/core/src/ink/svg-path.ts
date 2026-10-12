export function getSvgPathFromStroke(strokePoints: [number, number][], closed = true): string {
  const len = strokePoints.length;
  if (len === 0) return '';
  if (len === 1) {
    const [x, y] = strokePoints[0];
    return `M ${(x - 0.5).toFixed(2)} ${y.toFixed(2)} a 0.5 0.5 0 1 0 1 0 a 0.5 0.5 0 1 0 -1 0`;
  }
  if (len === 2) {
    return `M ${strokePoints[0][0].toFixed(2)},${strokePoints[0][1].toFixed(2)} L ${strokePoints[1][0].toFixed(2)},${strokePoints[1][1].toFixed(2)}${closed ? ' Z' : ''}`;
  }
  if (len === 3) {
    return `M ${strokePoints[0][0].toFixed(2)},${strokePoints[0][1].toFixed(2)} L ${strokePoints[1][0].toFixed(2)},${strokePoints[1][1].toFixed(2)} L ${strokePoints[2][0].toFixed(2)},${strokePoints[2][1].toFixed(2)}${closed ? ' Z' : ''}`;
  }

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
