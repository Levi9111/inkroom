import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/inkroom';

export default {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8080),
  databaseUrl,
  cors_origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  jwt_access_secret: process.env.JWT_ACCESS_SECRET || 'inkroom_jwt_access_secret_dev_123',
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '12h',
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || 'inkroom_jwt_refresh_secret_dev_123',
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
