import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import connectDB from './config/database';
import { redisClient } from './config/redis';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { setupSocketHandlers } from './sockets';
import { apiLimiter } from './middleware/rateLimiter';
import { scheduleMessageJob } from './services/notificationService';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000']
  : ['http://localhost:5173', 'http://localhost:3000', '*'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Nexora API is running',
    timestamp: new Date().toISOString(),
  });
});

// Connect to DB and Redis
connectDB();
redisClient.connect().catch(console.error);

// Routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

// Socket.io handlers
setupSocketHandlers(io);

// Start scheduled message checker
scheduleMessageJob();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║           🚀 Nexora Server Started             ║
╠════════════════════════════════════════════════╣
║  Port:         ${PORT}
║  Environment:  ${process.env.NODE_ENV || 'development'}
║  Database:     MongoDB Connected
║  WebSocket:    Socket.io Ready
╚════════════════════════════════════════════════╝
  `);
});

export { app, server, io };
