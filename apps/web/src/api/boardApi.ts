import type { Role, BoardMode } from '@inkroom/shared';

const getBaseUrl = (): string => {
  const envApi = (import.meta as any).env?.VITE_API_URL;
  if (envApi) return envApi;
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (isLocal) return 'http://localhost:8080';
  return window.location.origin;
};

const BASE_URL = getBaseUrl();

export interface CreateBoardResponse {
  boardId: string;
  roomCode: string;
  teacherSecret: string;
  teacherToken: string;
  teacherUrl: string;
  studentUrl: string;
  title: string;
}

export interface JoinBoardResponse {
  token: string;
  boardId: string;
  participantId: string;
  role: Role;
  title: string;
  mode: BoardMode;
}

export interface UploadAssetResponse {
  assetId: string;
  url: string;
  originalName: string;
  mimeType: string;
  bytes: number;
  boardId: string;
}

export async function createBoard(title = 'Untitled board'): Promise<CreateBoardResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to create board');
  }
  const json = await res.json();
  return json.data as CreateBoardResponse;
}

export async function joinBoard(
  roomCode: string,
  name: string,
  teacherSecret?: string
): Promise<JoinBoardResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/boards/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, name, teacherSecret }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to join board');
  }
  const json = await res.json();
  return json.data as JoinBoardResponse;
}

export async function getBoardInfo(boardId: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/boards/${boardId}/info`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function uploadAsset(
  boardId: string,
  file: File,
  token: string
): Promise<UploadAssetResponse> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE_URL}/api/v1/boards/${boardId}/assets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Asset upload failed');
  }
  const json = await res.json();
  return json.data as UploadAssetResponse;
}
