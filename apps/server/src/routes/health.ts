import { Router } from 'express';
import { isDbConnected } from '../db/connect';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Inkroom Collaboration Server',
    version: '1.2.0',
    timestamp: new Date().toISOString(),
    database: isDbConnected() ? 'connected' : 'in-memory-fallback',
  });
});

export default router;
