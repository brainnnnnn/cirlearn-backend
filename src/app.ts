import express from 'express';
import cors from 'cors';
import vlmRoutes from './routes/vlm';
import chatRoutes from './routes/chat';
import { logger } from './middleware/logger';
import { validateVLM, validateChat } from './middleware/requestValidator';
import { errorHandler } from './middleware/errorHandler';
import { config } from './lib/config';

export function createApp(): express.Application {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '10mb' }));
  app.use(logger);

  app.use('/vlm', validateVLM, vlmRoutes);
  app.use('/chat', validateChat, chatRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(errorHandler);

  return app;
}
