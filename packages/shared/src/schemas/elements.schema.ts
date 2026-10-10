import { z } from 'zod';

export const BaseElementSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['stroke', 'shape', 'text', 'image', 'latex', 'sticky']),
  x: z.number(),
  y: z.number(),
  rotation: z.number().default(0),
  z: z.string(),
  author: z.string(),
  createdAt: z.number(),
  locked: z.boolean().optional(),
});

export const StrokeSchema = BaseElementSchema.extend({
  type: z.literal('stroke'),
  tool: z.enum(['pen', 'highlighter']),
  color: z.string(),
  size: z.number().min(0.5).max(100),
  opacity: z.number().min(0).max(1),
  points: z.array(z.number()),
});

export const ShapeSchema = BaseElementSchema.extend({
  type: z.literal('shape'),
  kind: z.enum(['rect', 'ellipse', 'diamond', 'triangle', 'line', 'arrow']),
  width: z.number(),
  height: z.number(),
  stroke: z.string(),
  strokeWidth: z.number().min(0.5).max(50),
  fill: z.string().nullable(),
  dash: z.enum(['solid', 'dashed', 'dotted']),
  points: z.array(z.number()).optional(),
});

export const TextSchema = BaseElementSchema.extend({
  type: z.literal('text'),
  text: z.string(),
  fontFamily: z.enum(['sans', 'serif', 'mono', 'hand']),
  fontSize: z.number().min(8).max(200),
  color: z.string(),
  align: z.enum(['left', 'center', 'right']),
  bold: z.boolean(),
  italic: z.boolean(),
  width: z.number(),
});
