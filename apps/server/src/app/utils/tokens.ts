import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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

export function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

export function verifySecret(secret: string, hashed: string): boolean {
  const incomingHash = hashSecret(secret);
  return crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(hashed));
}

export function generateTeacherSecret(): string {
  return crypto.randomBytes(24).toString('base64url');
}
