import type { CanvasElement, Stroke, Shape } from '@inkroom/shared';

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function computeElementBounds(element: CanvasElement): BoundingBox {
  switch (element.type) {
    case 'stroke':
      return computeStrokeBounds(element);
    case 'shape':
      return computeShapeBounds(element);
    case 'text':
      return {
        minX: element.x,
        minY: element.y,
        maxX: element.x + element.width,
        maxY: element.y + element.fontSize * 1.4,
        width: element.width,
        height: element.fontSize * 1.4,
      };
    case 'image':
    case 'sticky':
      return {
        minX: element.x,
        minY: element.y,
        maxX: element.x + element.width,
        maxY: element.y + element.height,
        width: element.width,
        height: element.height,
      };
    case 'latex':
      return {
        minX: element.x,
        minY: element.y,
        maxX: element.x + 200,
        maxY: element.y + element.fontSize * 2,
        width: 200,
        height: element.fontSize * 2,
      };
  }
}

export function computeStrokeBounds(stroke: Stroke): BoundingBox {
  if (stroke.points.length === 0) {
    return {
      minX: stroke.x,
      minY: stroke.y,
      maxX: stroke.x,
      maxY: stroke.y,
      width: 0,
      height: 0,
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const halfWidth = stroke.size / 2;

  // Points are flat [x, y, pressure, x, y, pressure, ...] relative to stroke.x, stroke.y
  for (let i = 0; i < stroke.points.length; i += 3) {
    const px = stroke.x + stroke.points[i];
    const py = stroke.y + stroke.points[i + 1];

    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }

  minX -= halfWidth;
  minY -= halfWidth;
  maxX += halfWidth;
  maxY += halfWidth;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
  };
}

export function computeShapeBounds(shape: Shape): BoundingBox {
  const minX = Math.min(shape.x, shape.x + shape.width);
  const minY = Math.min(shape.y, shape.y + shape.height);
  const maxX = Math.max(shape.x, shape.x + shape.width);
  const maxY = Math.max(shape.y, shape.y + shape.height);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.abs(shape.width),
    height: Math.abs(shape.height),
  };
}

export function boxesIntersect(a: BoundingBox, b: BoundingBox): boolean {
  return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}
