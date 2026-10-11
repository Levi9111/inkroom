import { Router } from 'express';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';
import validateRequest from '../../utils/validateRequest';
import { BoardValidation } from './board.validation';
import { BoardController } from './board.controller';
import { participantAuth } from '../../middlewares/participantAuth.middleware';
import config from '../../config';
import AppError from '../../errors/AppError';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.upload_dir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const rand = crypto.randomBytes(16).toString('hex');
    cb(null, `${rand}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(StatusCodes.BAD_REQUEST, 'Invalid file type. Only JPEG, PNG, GIF, WEBP, and SVG are supported.'));
    }
  },
});

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

router.post(
  '/:id/assets',
  participantAuth('teacher', 'co-teacher', 'student'),
  upload.single('file'),
  BoardController.uploadAsset
);

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


