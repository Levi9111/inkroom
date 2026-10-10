import { Hocuspocus } from '@hocuspocus/server';
import { Database } from '@hocuspocus/extension-database';
import { verifyParticipantToken } from '../utils/tokens';
import { BoardModel } from '../modules/Board/board.model';
import { YDocModel, YDocChunkModel } from '../modules/Board/ydoc.model';
import { isConnected } from '../utils/connectDB';
import { canDraw, type PermissionContext } from '@inkroom/shared';

const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB safe chunk limit
const memoryYDocs = new Map<string, Buffer>();

export async function loadYState(documentName: string): Promise<Uint8Array | null> {
  if (isConnected) {
    try {
      const doc = await YDocModel.findById(documentName).lean();
      if (!doc) return null;

      if (doc.chunksCount > 1) {
        const chunks = await YDocChunkModel.find({ docId: documentName })
          .sort({ chunkIndex: 1 })
          .lean();
        const buffers = chunks.map((c) => c.data);
        return new Uint8Array(Buffer.concat(buffers));
      }

      return new Uint8Array(doc.state);
    } catch (err) {
      console.error(`[Realtime] Failed loading YDoc ${documentName}:`, err);
    }
  }

  const mem = memoryYDocs.get(documentName);
  return mem ? new Uint8Array(mem) : null;
}

export async function saveYState(documentName: string, state: Uint8Array): Promise<void> {
  const buffer = Buffer.from(state);
  const parts = documentName.split(':');
  const boardId = parts[1] || 'unknown';

  if (isConnected) {
    try {
      if (buffer.length > CHUNK_SIZE) {
        const totalChunks = Math.ceil(buffer.length / CHUNK_SIZE);
        await YDocChunkModel.deleteMany({ docId: documentName });

        const chunkDocs = [];
        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(buffer.length, (i + 1) * CHUNK_SIZE);
          chunkDocs.push({
            docId: documentName,
            chunkIndex: i,
            data: buffer.subarray(start, end),
          });
        }
        await YDocChunkModel.insertMany(chunkDocs);

        await YDocModel.findByIdAndUpdate(
          documentName,
          {
            boardId,
            state: Buffer.alloc(0),
            bytes: buffer.length,
            chunksCount: totalChunks,
            updatedAt: new Date(),
          },
          { upsert: true }
        );
      } else {
        await YDocModel.findByIdAndUpdate(
          documentName,
          {
            boardId,
            state: buffer,
            bytes: buffer.length,
            chunksCount: 1,
            updatedAt: new Date(),
          },
          { upsert: true }
        );
      }

      await BoardModel.findByIdAndUpdate(boardId, { lastActiveAt: new Date() });
      return;
    } catch (err) {
      console.error(`[Realtime] Failed saving YDoc ${documentName}:`, err);
    }
  }

  memoryYDocs.set(documentName, buffer);
}

export function createHocuspocusServer(): Hocuspocus {
  return new Hocuspocus({
    debounce: 2000,
    maxDebounce: 10000,

    async onAuthenticate({ token, documentName, connectionConfig }) {
      if (!token) {
        throw new Error('Authentication required');
      }

      let claims;
      try {
        claims = verifyParticipantToken(token);
      } catch (err) {
        throw new Error('Invalid or expired authentication token');
      }

      const parts = documentName.split(':');
      const docBoardId = parts[1];

      if (claims.boardId !== docBoardId) {
        throw new Error('Token does not grant access to this board');
      }

      const isPageDoc = parts.length >= 4 && parts[2] === 'page';
      const pageId = isPageDoc ? parts[3] : undefined;

      const permCtx: PermissionContext = {
        role: claims.role,
        mode: 'present', // Default mode evaluated on client/meta sync
        participantId: claims.participantId,
        pageKind: pageId?.startsWith('student_') ? 'student' : 'shared',
        pageOwnerId: pageId?.startsWith('student_') ? pageId.replace('student_', '') : undefined,
      };

      if (isPageDoc) {
        connectionConfig.readOnly = !canDraw(permCtx);
      } else {
        connectionConfig.readOnly = claims.role !== 'teacher' && claims.role !== 'co-teacher';
      }

      return {
        user: {
          id: claims.participantId,
          name: claims.name,
          role: claims.role,
        },
      };
    },

    extensions: [
      new Database({
        fetch: async ({ documentName }) => {
          return await loadYState(documentName);
        },
        store: async ({ documentName, state }) => {
          await saveYState(documentName, state);
        },
      }),
    ],
  });
}
