import { Router } from 'express';
import validateRequest from '../../utils/validateRequest';
import { BoardValidation } from './board.validation';
import { BoardController } from './board.controller';
import { participantAuth } from '../../middlewares/participantAuth.middleware';

const router = Router();

router.post(
  '/',
  validateRequest(BoardValidation.createBoardZodSchema),
  BoardController.createBoard
);

router.post(
  '/join',
  validateRequest(BoardValidation.joinBoardZodSchema),
  BoardController.joinBoard
);

router.get('/:id/info', BoardController.getBoard);

router.patch(
  '/:id',
  participantAuth('teacher', 'co-teacher'),
  validateRequest(BoardValidation.updateBoardZodSchema),
  BoardController.updateBoard
);

router.delete(
  '/:id',
  participantAuth('teacher'),
  BoardController.deleteBoard
);

export const BoardRoutes = router;

