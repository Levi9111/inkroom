import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { BoardRoutes } from '../modules/Board/board.route';
import { JoinRoutes } from '../modules/Board/join.route';

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
  { path: '/auth', route: AuthRoutes },
  { path: '/boards', route: BoardRoutes },
  { path: '/join', route: JoinRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
