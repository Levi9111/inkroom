export const STROKE_WIDTH_PRESETS = {
  S: 2,
  M: 4,
  L: 8,
  XL: 16,
} as const;

export const HIGHLIGHTER_WIDTH_PRESETS = {
  S: 12,
  M: 20,
  L: 32,
  XL: 48,
} as const;

export const ERASER_WIDTH_PRESETS = {
  S: 8,
  M: 16,
  L: 32,
  XL: 64,
} as const;

export const SYSTEM_LIMITS = {
  maxElementsPerPage: 20000,
  maxPointsPerStroke: 5000,
  maxUploadBytes: 10 * 1024 * 1024, // 10MB
  maxPdfPages: 100,
  maxPdfSizeBytes: 50 * 1024 * 1024, // 50MB
  maxPagesPerBoard: 200,
  maxParticipantsPerBoard: 60,
  boardRetentionDays: 30,
} as const;
