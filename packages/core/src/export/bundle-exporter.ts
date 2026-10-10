import type { BoardMeta, PageMeta, CanvasElement } from '@inkroom/shared';

export interface InkroomFileBundle {
  version: '1.0';
  generator: 'Inkroom Whiteboard';
  createdAt: number;
  meta: BoardMeta;
  pages: {
    pageMeta: PageMeta;
    elements: CanvasElement[];
  }[];
}

export function serializeInkroomBundle(bundle: InkroomFileBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export function parseInkroomBundle(jsonString: string): InkroomFileBundle {
  const parsed = JSON.parse(jsonString) as InkroomFileBundle;
  if (parsed.version !== '1.0') {
    throw new Error(`Unsupported Inkroom bundle version: ${parsed.version}`);
  }
  return parsed;
}
