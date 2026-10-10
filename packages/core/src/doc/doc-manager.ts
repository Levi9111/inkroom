import * as Y from 'yjs';
import type { CanvasElement, PageMeta, BoardMeta, ID } from '@inkroom/shared';

export class PageDocManager {
  public readonly doc: Y.Doc;
  public readonly elementsMap: Y.Map<CanvasElement>;
  public readonly localOrigin: symbol;
  public readonly undoManager: Y.UndoManager;

  constructor(doc?: Y.Doc) {
    this.doc = doc ?? new Y.Doc();
    this.elementsMap = this.doc.getMap<CanvasElement>('elements');
    this.localOrigin = Symbol('local-origin');

    // Scoped strictly to local transactions
    this.undoManager = new Y.UndoManager(this.elementsMap, {
      trackedOrigins: new Set([this.localOrigin]),
    });
  }

  public setElement(element: CanvasElement): void {
    this.doc.transact(() => {
      this.elementsMap.set(element.id, element);
    }, this.localOrigin);
  }

  public deleteElement(id: ID): void {
    this.doc.transact(() => {
      this.elementsMap.delete(id);
    }, this.localOrigin);
  }

  public getElement(id: ID): CanvasElement | undefined {
    return this.elementsMap.get(id);
  }

  public getAllElements(): CanvasElement[] {
    const list: CanvasElement[] = [];
    this.elementsMap.forEach((el) => list.push(el));
    // Sort by fractional index (z-order)
    return list.sort((a, b) => (a.z > b.z ? 1 : a.z < b.z ? -1 : 0));
  }

  public undo(): void {
    this.undoManager.undo();
  }

  public redo(): void {
    this.undoManager.redo();
  }

  public canUndo(): boolean {
    return this.undoManager.canUndo();
  }

  public canRedo(): boolean {
    return this.undoManager.canRedo();
  }

  public destroy(): void {
    this.undoManager.destroy();
    this.doc.destroy();
  }
}
