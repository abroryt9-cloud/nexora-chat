import express from 'express';
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

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Connect to DB and Redis
connectDB();
redisClient.connect().catch(console.error);

// Routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

// Socket.io
setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
