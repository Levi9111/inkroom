import { Router } from 'express';
import { nanoid } from 'nanoid';
import { JoinBoardSchema, sanitizeRoomCode, type Role } from '@inkroom/shared';
import { findBoardByRoomCode, findBoardById } from '../db/store';
import { verifySecret, signParticipantToken } from '../services/tokens';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const parseResult = JoinBoardSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
    }

    const { roomCode, name, teacherSecret } = parseResult.data;
    const cleanCode = sanitizeRoomCode(roomCode);

    let board = await findBoardByRoomCode(cleanCode);
    if (!board) {
      // Also check if the user provided the board ID directly
      board = await findBoardById(roomCode);
    }

    if (!board) {
      return res.status(404).json({ error: 'Invalid room code or board expired' });
    }

    let role: Role = 'student';

    if (teacherSecret && board.teacherSecretHash) {
      if (verifySecret(teacherSecret, board.teacherSecretHash)) {
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

    res.json({
      token,
      boardId: board._id,
      participantId,
      role,
      title: board.title,
      mode: board.mode,
    });
  } catch (err) {
    console.error('Error joining board:', err);
    res.status(500).json({ error: 'Failed to join board' });
  }
});

export default router;
