import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../errors/AppError';
import { verifyParticipantToken } from '../utils/tokens';
import type { JwtClaims, Role } from '@inkroom/shared';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      participant?: JwtClaims;
    }
  }
}

/**
 * Extracts and verifies the participant JWT from Authorization header or x-participant-token.
 * Attaches req.participant and enforces role and boardId matching.
 */
export const participantAuth = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : (req.headers['x-participant-token'] as string | undefined);

      if (!token) {
        return next(
          new AppError(StatusCodes.UNAUTHORIZED, 'No participant token provided')
        );
      }

      const claims = verifyParticipantToken(token);

      if (allowedRoles.length && !allowedRoles.includes(claims.role as Role)) {
        return next(
          new AppError(StatusCodes.FORBIDDEN, 'Insufficient board permissions')
        );
      }

      // Ensure the token's boardId matches the route param (if :id exists)
      if (req.params.id && claims.boardId !== req.params.id) {
        return next(
          new AppError(StatusCodes.FORBIDDEN, 'Token does not match this board')
        );
      }

      req.participant = claims;
      next();
    } catch {
      next(
        new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired participant token')
      );
    }
  };
};

export default participantAuth;
