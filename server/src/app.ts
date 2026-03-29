import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import apiRoutes from './routes';
import { registerSockets } from './sockets';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  },
});

// CORS настройки
app.use(cors({ 
  origin: process.env.CLIENT_URL || true, 
  credentials: true 
}));

// Безопасность
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Логирование запросов в development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    ok: true, 
    service: 'nexora-server',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API роуты
app.use('/api/v1', apiRoutes);

// 404 обработка
app.use('*', (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Глобальная обработка ошибок
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

// Подключение сокетов
registerSockets(io);

const port = Number(process.env.PORT || 5000);

// Запуск сервера
const startServer = async (): Promise<void> => {
  try {
    // Подключение к базе данных
    await connectDatabase();
    
    // Запуск HTTP сервера
    server.listen(port, () => {
      logger.info(`🚀 Nexora server started on port ${port}`);
      logger.info(`📊 Health check: http://localhost:${port}/health`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Запуск только если не в тестовом режиме
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
