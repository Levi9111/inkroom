import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import fs from 'fs';
import config from './app/config';
import logger from './app/utils/logger';
import { cemWelcomePage } from './app/utils/welcomePage';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './app/config/swagger';
import cookieParser from 'cookie-parser';
import { globalRateLimiter } from './app/middlewares/rateLimiter.middleware';
import router from './app/routes';
import notFound from './app/middlewares/notFound.middleware';
import globalErrorHandler from './app/middlewares/globalErrorHandler.middleware';

const app: Application = express();

app.disable('x-powered-by');

// ── Global Middlewares ────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'ws:', 'wss:', '*'],
        imgSrc: ["'self'", 'data:', 'blob:', '*'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors({ origin: config.cors_origin, credentials: true }));
app.use(compression());
app.use(globalRateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Static Uploads ────────────────────────────────────────────────────────────
if (!fs.existsSync(config.upload_dir)) {
  fs.mkdirSync(config.upload_dir, { recursive: true });
}
app.use(
  '/uploads',
  express.static(config.upload_dir, {
    maxAge: '7d',
    immutable: true,
  })
);


// ── API Documentation ─────────────────────────────────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response): void => {
  res.setHeader('Content-Type', 'text/html');
  res.send(cemWelcomePage());
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response): void => {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();
  logger.info(`Health check called — uptime: ${uptime.toFixed(2)}s`);
  res.status(200).json({
    status: 'ok',
    uptime: parseFloat(uptime.toFixed(2)),
    timestamp,
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1', router);

// ── Error Handlers (must be last) ────────────────────────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

export default app;
