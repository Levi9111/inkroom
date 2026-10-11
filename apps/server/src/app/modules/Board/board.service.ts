import { nanoid } from 'nanoid';
import { generateRoomCode, sanitizeRoomCode, type Role } from '@inkroom/shared';
import { BoardModel } from './board.model';
import { YDocModel, YDocChunkModel } from '../../realtime/ydoc.model';
import { generateTeacherSecret, hashSecret, verifySecret, signParticipantToken } from '../../utils/tokens';
import { isConnected } from '../../utils/connectDB';

// In-memory fallback
const memoryBoards = new Map<string, any>();
const memoryRoomCodes = new Map<string, string>(); // roomCode -> boardId

export const BoardService = {
  async createBoard(title: string) {
    const boardId = nanoid(12);

    let roomCode = generateRoomCode();
    while (memoryRoomCodes.has(roomCode) || (isConnected && (await BoardModel.findOne({ roomCode })))) {
      roomCode = generateRoomCode();
    }

    const teacherSecret = generateTeacherSecret();
    const teacherSecretHash = await hashSecret(teacherSecret);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const boardData = {
      _id: boardId,
      title: title || 'Untitled board',
      roomCode,
      teacherSecretHash,
      coTeacherSecretHashes: [],
      mode: 'present',
      settings: {
        studentsCanUndoOthers: false,
        allowStudentImages: true,
        maxElementsPerPage: 20000,
      },
      lastActiveAt: now,
      expiresAt,
    };

    if (isConnected) {
      await BoardModel.create(boardData);
    } else {
      memoryBoards.set(boardId, boardData);
      memoryRoomCodes.set(roomCode, boardId);
    }

    const teacherToken = signParticipantToken({
      boardId,
      participantId: 'teacher_' + nanoid(8),
      role: 'teacher',
      name: 'Teacher',
    });

    return {
      boardId,
      roomCode,
      teacherSecret,
      teacherToken,
      teacherUrl: `/t/${boardId}#${teacherSecret}`,
      studentUrl: `/b/${roomCode}`,
      title: boardData.title,
    };
  },

  async getBoardById(id: string) {
    if (isConnected) {
      const board = (await BoardModel.findById(id).lean()) as any;
      if (!board) return null;
      return {
        boardId: board._id as string,
        title: board.title as string,
        roomCode: board.roomCode as string,
        mode: board.mode as any,
        createdAt: board.createdAt as Date,
      };
    }

    const mem = memoryBoards.get(id);
    if (!mem) return null;
    return {
      boardId: mem._id,
      title: mem.title,
      roomCode: mem.roomCode,
      mode: mem.mode,
      createdAt: mem.lastActiveAt,
    };
  },

  async updateBoard(id: string, updates: any) {
    if (isConnected) {
      return await BoardModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    }
    const mem = memoryBoards.get(id);
    if (!mem) return null;
    const updated = { ...mem, ...updates, updatedAt: new Date() };
    memoryBoards.set(id, updated);
    return updated;
  },

  async deleteBoard(id: string) {
    if (isConnected) {
      await BoardModel.findByIdAndDelete(id);
      await YDocModel.deleteMany({ boardId: id });
      await YDocChunkModel.deleteMany({ docId: new RegExp(`^board:${id}:`) });
    } else {
      const mem = memoryBoards.get(id);
      if (mem) {
        memoryRoomCodes.delete(mem.roomCode);
        memoryBoards.delete(id);
      }
    }
  },

  async joinBoard(roomCode: string, name: string, teacherSecret?: string) {
    const cleanCode = sanitizeRoomCode(roomCode);
    let board: any = null;

    if (isConnected) {
      board = await BoardModel.findOne({ roomCode: cleanCode }).lean();
      if (!board) {
        board = await BoardModel.findById(roomCode).lean();
      }
    } else {
      const id = memoryRoomCodes.get(cleanCode) || roomCode;
      board = memoryBoards.get(id) || null;
    }

    if (!board) {
      throw new Error('Invalid room code or board has expired');
    }

    let role: Role = 'student';
    if (teacherSecret && board.teacherSecretHash) {
      if (await verifySecret(teacherSecret, board.teacherSecretHash)) {
        role = 'teacher';
      }
    }

    const participantId = role === 'teacher' ? 'teacher_' + nanoid(8) : 'student_' + nanoid(8);

    const token = signParticipantToken({
      boardId: board._id,
      participantId,
      role,
      name,
    });

    return {
      token,
      boardId: board._id,
      participantId,
      role,
      title: board.title,
      mode: board.mode,
    };
  },
};
