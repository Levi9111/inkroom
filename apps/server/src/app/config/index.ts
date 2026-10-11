import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/inkroom';

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

if (process.env.NODE_ENV === 'production') {
  if (!jwtAccessSecret) {
    throw new Error('FATAL: JWT_ACCESS_SECRET environment variable is missing in production');
  }
  if (!jwtRefreshSecret) {
    throw new Error('FATAL: JWT_REFRESH_SECRET environment variable is missing in production');
  }
}

export default {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8080),
  databaseUrl,
  cors_origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : process.env.NODE_ENV === 'production'
    ? []
    : ['*'],
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  jwt_access_secret: jwtAccessSecret || 'inkroom_jwt_access_secret_dev_123',
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '12h',
  jwt_refresh_secret: jwtRefreshSecret || 'inkroom_jwt_refresh_secret_dev_123',
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

