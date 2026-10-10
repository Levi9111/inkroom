import { getStroke } from 'perfect-freehand';

export interface FreehandOptions {
  size?: number;
  thinning?: number;
  smoothing?: number;
  streamline?: number;
  easing?: (t: number) => number;
  simulatePressure?: boolean;
}

export function computeStrokeOutline(
  points: number[], // [x, y, pressure, x, y, pressure, ...]
  options: FreehandOptions = {}
): [number, number][] {
  const inputPoints: [number, number, number][] = [];
  const numPoints = points.length / 3;

  for (let i = 0; i < numPoints; i++) {
    inputPoints.push([points[i * 3], points[i * 3 + 1], points[i * 3 + 2] ?? 0.5]);
  }

  const strokeOptions = {
    size: options.size ?? 4,
    thinning: options.thinning ?? 0.5,
    smoothing: options.smoothing ?? 0.5,
    streamline: options.streamline ?? 0.5,
    simulatePressure: options.simulatePressure ?? false,
    last: true,
  };

  return getStroke(inputPoints, strokeOptions) as [number, number][];
}
