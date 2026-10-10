import { z } from 'zod';

export const BoardModeSchema = z.enum(['present', 'collaborate', 'individual', 'locked']);

export const CreateBoardSchema = z.object({
  title: z.string().trim().min(1).max(120).default('Untitled board'),
  initialPages: z.number().int().min(1).max(50).default(1),
});

export const JoinBoardSchema = z.object({
  roomCode: z.string().trim().min(4).max(16),
  name: z.string().trim().min(1).max(40),
  teacherSecret: z.string().optional(),
});

export const UpdateBoardSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  mode: BoardModeSchema.optional(),
  settings: z
    .object({
      allowStudentImages: z.boolean().optional(),
      maxElementsPerPage: z.number().int().min(100).max(50000).optional(),
    })
    .optional(),
});
