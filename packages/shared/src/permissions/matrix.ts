import type { Role } from '../types/roles';
import type { BoardMode } from '../types/board';
import type { ID } from '../types/elements';

export interface PermissionContext {
  role: Role;
  mode: BoardMode;
  isMuted?: boolean;
  participantId: ID;
  pageKind?: 'shared' | 'student';
  pageOwnerId?: ID;
}

export function canDraw(ctx: PermissionContext): boolean {
  if (ctx.role === 'viewer') return false;
  if (ctx.role === 'teacher' || ctx.role === 'co-teacher') return true;

  // Student permissions depending on mode and mute state
  if (ctx.isMuted) return false;
  if (ctx.mode === 'locked') return false;
  if (ctx.mode === 'present') return false;

  if (ctx.mode === 'collaborate') {
    return true;
  }

  if (ctx.mode === 'individual') {
    // Student can only draw on their own individual page
    return ctx.pageKind === 'student' && ctx.pageOwnerId === ctx.participantId;
  }

  return false;
}

export function canManageBoard(role: Role): boolean {
  return role === 'teacher' || role === 'co-teacher';
}

export function canChangeMode(role: Role): boolean {
  return role === 'teacher' || role === 'co-teacher';
}

export function canKickParticipant(actorRole: Role, targetRole: Role): boolean {
  if (actorRole === 'teacher') return targetRole !== 'teacher';
  if (actorRole === 'co-teacher') return targetRole === 'student' || targetRole === 'viewer';
  return false;
}

export function canDeleteElement(ctx: PermissionContext, elementAuthorId: ID): boolean {
  if (ctx.role === 'teacher' || ctx.role === 'co-teacher') return true;
  if (!canDraw(ctx)) return false;
  // Students can only delete their own elements
  return elementAuthorId === ctx.participantId;
}
