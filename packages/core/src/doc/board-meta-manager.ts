import * as Y from 'yjs';
import type { BoardMeta, PageMeta, ID } from '@inkroom/shared';

export class BoardMetaDocManager {
  public readonly doc: Y.Doc;
  public readonly boardMap: Y.Map<any>;
  public readonly pagesMap: Y.Map<PageMeta>;
  public readonly localOrigin: symbol;

  constructor(doc?: Y.Doc) {
    this.doc = doc ?? new Y.Doc();
    this.boardMap = this.doc.getMap('board');
    this.pagesMap = this.doc.getMap<PageMeta>('pages');
    this.localOrigin = Symbol('meta-local-origin');
  }

  public setBoardMeta(meta: Partial<BoardMeta>): void {
    this.doc.transact(() => {
      for (const [key, value] of Object.entries(meta)) {
        this.boardMap.set(key, value);
      }
    }, this.localOrigin);
  }

  public getBoardMeta(): Partial<BoardMeta> {
    return this.boardMap.toJSON() as Partial<BoardMeta>;
  }

  public setPage(page: PageMeta): void {
    this.doc.transact(() => {
      this.pagesMap.set(page.id, page);
    }, this.localOrigin);
  }

  public deletePage(pageId: ID): void {
    this.doc.transact(() => {
      this.pagesMap.delete(pageId);
    }, this.localOrigin);
  }

  public getPages(): PageMeta[] {
    const list: PageMeta[] = [];
    this.pagesMap.forEach((p) => list.push(p));
    return list.sort((a, b) => (a.index > b.index ? 1 : a.index < b.index ? -1 : 0));
  }
}
