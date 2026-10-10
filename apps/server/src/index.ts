import http from 'http';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { config } from './config';
import { connectDatabase } from './db/connect';
import { createHocuspocusServer } from './realtime/hocuspocus';
import boardsRouter from './routes/boards';
import joinRouter from './routes/join';
import healthRouter from './routes/health';

async function bootstrap() {
  await connectDatabase();

  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false, // Handled in client headers/meta
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.allowedOrigins.includes('*') || config.allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Origin not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '100kb' }));

  // REST API Routes
  app.use('/api/boards', boardsRouter);
  app.use('/api/join', joinRouter);
  app.use('/healthz', healthRouter);
  app.use('/api/health', healthRouter);

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });
  const hocuspocus = createHocuspocusServer();

  server.on('upgrade', (request, socket, head) => {
    const origin = request.headers.origin;
    if (
      origin &&
      !config.allowedOrigins.includes('*') &&
      !config.allowedOrigins.includes(origin)
    ) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      hocuspocus.handleConnection(ws, request);
    });
  });

  server.listen(config.port, () => {
    console.log(`[Inkroom] Server running on http://localhost:${config.port}`);
    console.log(`[Inkroom] Real-time collaboration WebSocket endpoint ready`);
  });
}

bootstrap().catch((err) => {
  console.error('[Inkroom] Fatal startup error:', err);
  process.exit(1);
});
