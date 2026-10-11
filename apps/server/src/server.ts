import { Server } from 'http';
import { WebSocketServer } from 'ws';
import app from './app';
import config from './app/config';
import logger from './app/utils/logger';
import { connectDB } from './app/utils/connectDB';
import { createHocuspocusServer } from './app/realtime/hocuspocus';

let server: Server;

async function bootstrap() {
  try {
    await connectDB();

    server = app.listen(config.port, () => {
      logger.info(`Server running on http://localhost:${config.port}`);
      logger.info(`API docs available on http://localhost:${config.port}/docs`);
    });

    // Ensure Keep-Alive timeouts for reverse proxies (ALB/Nginx/Cloudflare)
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

    // Attach Hocuspocus WebSocket Server
    const wss = new WebSocketServer({ noServer: true });
    const hocuspocus = createHocuspocusServer();

    server.on('upgrade', (request, socket, head) => {
      const origin = request.headers.origin;
      const allowed = config.cors_origin;

      if (config.NODE_ENV === 'production' && !allowed.includes('*')) {
        if (!origin || !allowed.includes(origin)) {
          logger.warn(`Rejected WebSocket upgrade from untrusted origin: ${origin}`);
          socket.destroy();
          return;
        }
      } else if (
        origin &&
        Array.isArray(allowed) &&
        !allowed.includes('*') &&
        !allowed.includes(origin)
      ) {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        hocuspocus.handleConnection(ws, request);
      });
    });

    logger.info('Hocuspocus real-time collaboration WebSocket handler attached');
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection detected, shutting down server...', reason);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception detected, shutting down server...', error);
  process.exit(1);
});
