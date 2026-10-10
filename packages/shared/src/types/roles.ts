import type { ID } from './elements';

export type Role = 'teacher' | 'co-teacher' | 'student' | 'viewer';

export interface Participant {
  id: ID;
  name: string;
  role: Role;
  color: string;
  joinedAt: number;
  isMuted?: boolean;
}
