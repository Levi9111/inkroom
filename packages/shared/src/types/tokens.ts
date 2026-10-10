import type { ID } from './elements';
import type { Role } from './roles';

export interface JwtClaims {
  boardId: ID;
  participantId: ID;
  role: Role;
  name: string;
  iat?: number;
  exp?: number;
}

export interface JoinRequest {
  roomCode: string;
  name: string;
  teacherSecret?: string;
}

export interface JoinResponse {
  token: string;
  boardId: ID;
  participantId: ID;
  role: Role;
  title: string;
}

export interface CreateBoardResponse {
  boardId: ID;
  roomCode: string;
  teacherSecret: string;
  teacherUrl: string;
  studentUrl: string;
}
