import { Router } from 'express';
import validateRequest from '../../utils/validateRequest';
import { BoardValidation } from './board.validation';
import { BoardController } from './board.controller';

const router = Router();

router.post(
  '/',
  validateRequest(BoardValidation.joinBoardZodSchema),
  BoardController.joinBoard
);

export const JoinRoutes = router;
