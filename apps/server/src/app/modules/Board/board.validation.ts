import { z } from 'zod';
import { CreateBoardSchema, UpdateBoardSchema, JoinBoardSchema } from '@inkroom/shared';

export const BoardValidation = {
  createBoardZodSchema: z.object({
    body: CreateBoardSchema,
  }),
  updateBoardZodSchema: z.object({
    body: UpdateBoardSchema,
  }),
  joinBoardZodSchema: z.object({
    body: JoinBoardSchema,
  }),
};
