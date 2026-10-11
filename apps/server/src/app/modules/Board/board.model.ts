import mongoose, { Schema } from 'mongoose';
import type { IBoard } from './board.interface';

const BoardSchema = new Schema<IBoard>(
  {
    _id: { type: String, required: true },
    title: { type: String, default: 'Untitled board', maxlength: 120 },
    roomCode: { type: String, required: true, unique: true, index: true },
    teacherSecretHash: { type: String, required: true },
    coTeacherSecretHashes: { type: [String], default: [] },
    mode: {
      type: String,
      enum: ['present', 'collaborate', 'individual', 'locked'],
      default: 'present',
    },
    settings: {
      studentsCanUndoOthers: { type: Boolean, default: false },
      allowStudentImages: { type: Boolean, default: true },
      maxElementsPerPage: { type: Number, default: 20000 },
    },
    lastActiveAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

export const BoardModel = mongoose.models.Board || mongoose.model<IBoard>('Board', BoardSchema);
