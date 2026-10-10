import { Router } from 'express';
import validateRequest from '../../utils/validateRequest';
import { BoardValidation } from './board.validation';
import { BoardController } from './board.controller';

const router = Router();

router.post(
  '/',
  validateRequest(BoardValidation.createBoardZodSchema),
  BoardController.createBoard
);

router.get('/:id/info', BoardController.getBoard);
router.patch('/:id', validateRequest(BoardValidation.updateBoardZodSchema), BoardController.updateBoard);
router.delete('/:id', BoardController.deleteBoard);

export const BoardRoutes = router;
