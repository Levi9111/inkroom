import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { BoardRoutes } from '../modules/Board/board.route';

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
  { path: '/auth', route: AuthRoutes },
  { path: '/boards', route: BoardRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
