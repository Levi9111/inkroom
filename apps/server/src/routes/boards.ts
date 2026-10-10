import { Router } from 'express';
import { nanoid } from 'nanoid';
import { CreateBoardSchema, UpdateBoardSchema, generateRoomCode, sanitizeRoomCode } from '@inkroom/shared';
import { createBoardInDb, findBoardById, updateBoardInDb, deleteBoardInDb, findBoardByRoomCode } from '../db/store';
import { generateTeacherSecret, hashSecret, verifySecret, signParticipantToken } from '../services/tokens';
import { config } from '../config';

const router = Router();

// Create new board
router.post('/', async (req, res) => {
  try {
    const parseResult = CreateBoardSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
    }

    const { title } = parseResult.data;
    const boardId = nanoid(12);

    let roomCode = generateRoomCode();
    // Ensure room code uniqueness
    while (await findBoardByRoomCode(roomCode)) {
      roomCode = generateRoomCode();
    }

    const teacherSecret = generateTeacherSecret();
    const teacherSecretHash = hashSecret(teacherSecret);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.boardRetentionDays * 24 * 60 * 60 * 1000);

    const board = await createBoardInDb({
      _id: boardId,
      title,
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
    });

    const teacherToken = signParticipantToken({
      boardId,
      participantId: 'teacher_' + nanoid(8),
      role: 'teacher',
      name: 'Teacher',
    });

    res.status(201).json({
      boardId,
      roomCode,
      teacherSecret,
      teacherToken,
      teacherUrl: `/t/${boardId}#${teacherSecret}`,
      studentUrl: `/b/${roomCode}`,
      title: board.title,
    });
  } catch (err) {
    console.error('Error creating board:', err);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Get public board info
router.get('/:id/info', async (req, res) => {
  try {
    const board = await findBoardById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json({
      boardId: board._id,
      title: board.title,
      roomCode: board.roomCode,
      mode: board.mode,
      createdAt: board.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch board info' });
  }
});

// Update board (teacher mode switch, settings)
router.patch('/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const parseResult = UpdateBoardSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
    }

    const updated = await updateBoardInDb(req.params.id, parseResult.data);
    if (!updated) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update board' });
  }
});

// Delete board
router.delete('/:id', async (req, res) => {
  try {
    await deleteBoardInDb(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

export default router;
