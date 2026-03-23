/**
 * Nexora Root Server
 * Простой сервер для деплоя на Render
 * 
 * Запуск: node server.js
 * Порт: process.env.PORT || 3000
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000']
  : ['http://localhost:5173', 'http://localhost:3000'];

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin && process.env.NODE_ENV === 'production') {
        return callback(new Error('Missing origin'), false);
      }
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client/dist (if exists)
const clientDistPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDistPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Nexora API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Nexora',
    version: '1.0.0',
    description: 'Enterprise Messenger with AI Assistant',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      websocket: 'wss://<host>/socket.io/',
    },
    status: 'running',
  });
});

// API proxy placeholder (for future integration with server/ app)
app.use('/api/v1', (req, res) => {
  res.status(200).json({
    message: 'API endpoint - full implementation in server/ directory',
    note: 'For production, deploy server/src/app.ts separately',
  });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);

  // Auth handshake
  socket.on('auth', (data) => {
    console.log(`[WebSocket] Auth from ${socket.id}:`, data?.userId || 'anonymous');
    socket.emit('auth_ok', {
      success: true,
      socketId: socket.id,
      timestamp: Date.now(),
    });
  });

  // Test message
  socket.on('message', (data) => {
    console.log(`[WebSocket] Message from ${socket.id}:`, data);
    socket.emit('message', {
      from: 'server',
      text: `Echo: ${data?.text || 'no text'}`,
      timestamp: Date.now(),
    });
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.emit('userTyping', {
      userId: data?.userId || 'unknown',
      isTyping: data?.isTyping || false,
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

// 404 handler - serve client index.html for SPA
app.use((req, res, next) => {
  const indexHtmlPath = path.join(clientDistPath, 'index.html');
  const fs = require('fs');
  
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath);
  } else {
    res.status(404).json({
      error: 'Not Found',
      message: 'Page not found',
      path: req.path,
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║           🚀 Nexora Server Started             ║');
  console.log('╠════════════════════════════════════════════════╣');
  console.log(`║  Port:         ${PORT}`.padEnd(49) + '║');
  console.log(`║  Environment:  ${process.env.NODE_ENV || 'development'}`.padEnd(49) + '║');
  console.log(`║  CORS Origins: ${allowedOrigins.join(', ')}`.padEnd(49) + '║');
  console.log('╠════════════════════════════════════════════════╣');
  console.log('║  Endpoints:                                    ║');
  console.log('║    GET  /           - API Info' + ' '.repeat(26) + '║');
  console.log('║    GET  /health     - Health Check' + ' '.repeat(22) + '║');
  console.log('║    GET  /api/v1     - API v1' + ' '.repeat(28) + '║');
  console.log('║    WS   /socket.io/ - WebSocket' + ' '.repeat(24) + '║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
