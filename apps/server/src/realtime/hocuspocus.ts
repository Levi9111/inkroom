import { Hocuspocus } from '@hocuspocus/server';
import { Database } from '@hocuspocus/extension-database';
import { verifyParticipantToken } from '../services/tokens';
import { loadYState, saveYState, findBoardById } from '../db/store';
import { canDraw, type PermissionContext } from '@inkroom/shared';

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

      const board = await findBoardById(docBoardId);
      if (!board) {
        throw new Error('Board does not exist');
      }

      const isPageDoc = parts.length >= 4 && parts[2] === 'page';
      const pageId = isPageDoc ? parts[3] : undefined;

      const permCtx: PermissionContext = {
        role: claims.role,
        mode: board.mode,
        participantId: claims.participantId,
        pageKind: pageId?.startsWith('student_') ? 'student' : 'shared',
        pageOwnerId: pageId?.startsWith('student_') ? pageId.replace('student_', '') : undefined,
      };

      // Set connection read-only according to permission matrix
      if (isPageDoc) {
        connectionConfig.readOnly = !canDraw(permCtx);
      } else {
        // Meta doc can only be edited by teachers
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
