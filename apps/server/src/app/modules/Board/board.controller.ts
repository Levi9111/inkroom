import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BoardService } from './board.service';

export const BoardController = {
  createBoard: catchAsync(async (req: Request, res: Response) => {
    const result = await BoardService.createBoard(req.body.title);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Board created successfully',
      data: result,
    });
  }),

  getBoard: catchAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await BoardService.getBoardById(id);
    if (!result) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Board not found',
      });
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Board retrieved successfully',
      data: result,
    });
  }),

  updateBoard: catchAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await BoardService.updateBoard(id, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Board updated successfully',
      data: result,
    });
  }),

  deleteBoard: catchAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await BoardService.deleteBoard(id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Board deleted successfully',
      data: null,
    });
  }),

  joinBoard: catchAsync(async (req: Request, res: Response) => {
    const { roomCode, name, teacherSecret } = req.body;
    const result = await BoardService.joinBoard(roomCode, name, teacherSecret);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Joined board successfully',
      data: result,
    });
  }),
};
