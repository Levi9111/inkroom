import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import config from '../config';
import type { JwtClaims } from '@inkroom/shared';

export function signParticipantToken(
  claims: Omit<JwtClaims, 'iat' | 'exp'>,
  expiresIn = '12h'
): string {
  return jwt.sign(claims, (config.jwt_access_secret || 'inkroom_jwt_secret') as jwt.Secret, {
    expiresIn: expiresIn as any,
  });
}

export function verifyParticipantToken(token: string): JwtClaims {
  return jwt.verify(token, config.jwt_access_secret || 'inkroom_jwt_secret') as JwtClaims;
}

export async function hashSecret(secret: string): Promise<string> {
  return bcrypt.hash(secret, config.bcrypt_salt_rounds || 12);
}

export async function verifySecret(secret: string, hashed: string): Promise<boolean> {
  try {
    return await bcrypt.compare(secret, hashed);
  } catch {
    return false;
  }
}

export function generateTeacherSecret(): string {
  return crypto.randomBytes(24).toString('base64url');
}
