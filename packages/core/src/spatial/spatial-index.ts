import RBush from 'rbush';
import type { CanvasElement } from '@inkroom/shared';
import { computeElementBounds, type BoundingBox } from '../geometry/bbox';

export interface SpatialItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  id: string;
}

export class CanvasSpatialIndex {
  private tree: RBush<SpatialItem>;
  private itemMap: Map<string, SpatialItem>;

  constructor() {
    this.tree = new RBush<SpatialItem>();
    this.itemMap = new Map();
  }

  public insert(element: CanvasElement): void {
    const bounds = computeElementBounds(element);
    const item: SpatialItem = {
      minX: bounds.minX,
      minY: bounds.minY,
      maxX: bounds.maxX,
      maxY: bounds.maxY,
      id: element.id,
    };
    this.remove(element.id);
    this.tree.insert(item);
    this.itemMap.set(element.id, item);
  }

  public remove(id: string): void {
    const existing = this.itemMap.get(id);
    if (existing) {
      this.tree.remove(existing);
      this.itemMap.delete(id);
    }
  }

  public clear(): void {
    this.tree.clear();
    this.itemMap.clear();
  }

  public queryViewport(bounds: BoundingBox): string[] {
    const results = this.tree.search({
      minX: bounds.minX,
      minY: bounds.minY,
      maxX: bounds.maxX,
      maxY: bounds.maxY,
    });
    return results.map((r) => r.id);
  }

  public queryPoint(x: number, y: number, radius = 5): string[] {
    return this.queryViewport({
      minX: x - radius,
      minY: y - radius,
      maxX: x + radius,
      maxY: y + radius,
      width: radius * 2,
      height: radius * 2,
    });
  }
}
