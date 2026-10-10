import type { BoardMode, BoardSettings } from '@inkroom/shared';

export interface IBoard {
  _id: string;
  title: string;
  roomCode: string;
  teacherSecretHash: string;
  coTeacherSecretHashes: string[];
  mode: BoardMode;
  settings: BoardSettings;
  lastActiveAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
