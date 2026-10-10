import type { ID } from './elements';
import type { Role } from './roles';

export interface DraftStroke {
  tool: 'pen' | 'highlighter';
  color: string;
  size: number;
  points: number[];
}

export interface LaserTrail {
  points: number[];
  t: number;
}

export interface AwarenessState {
  user: {
    id: ID;
    name: string;
    color: string;
    role: Role;
  };
  cursor?: {
    x: number;
    y: number;
    pageId: ID;
  };
  tool?: string;
  draft?: DraftStroke;
  laser?: LaserTrail;
  handRaised?: boolean;
  viewport?: {
    x: number;
    y: number;
    zoom: number;
    pageId: ID;
  };
}
