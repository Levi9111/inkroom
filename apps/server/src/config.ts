import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inkroom',
  jwtSecret: process.env.JWT_SECRET || 'inkroom-dev-secret-key-change-in-production-12345',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '*').split(',').map((s) => s.trim()),
  assetStorage: process.env.ASSET_STORAGE || 'local',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  boardRetentionDays: parseInt(process.env.BOARD_RETENTION_DAYS || '30', 10),
  maxUploadBytes: 10 * 1024 * 1024, // 10MB
};
