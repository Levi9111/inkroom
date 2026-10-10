import type { ID } from './elements';

export type BoardMode = 'present' | 'collaborate' | 'individual' | 'locked';

export interface BoardSettings {
  studentsCanUndoOthers: false;
  allowStudentImages: boolean;
  maxElementsPerPage: number;
}

export interface BoardMeta {
  id: ID;
  title: string;
  roomCode: string;
  createdAt: number;
  mode: BoardMode;
  settings: BoardSettings;
}

export type PageBackground =
  | { type: 'blank'; color: string }
  | { type: 'lined' | 'grid' | 'dots' | 'graph' | 'axes'; color: string; spacing: number }
  | { type: 'image' | 'pdf'; assetId: ID; pageIndex?: number; width: number; height: number };

export interface PageMeta {
  id: ID;
  index: string; // Fractional index for page sequence
  kind: 'shared' | 'student';
  ownerId?: ID; // For student-specific pages in individual mode
  title?: string;
  background: PageBackground;
}
