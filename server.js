/**
 * Nexora Root Server
 * Сервер для деплоя на Render с поддержкой:
 * - Клиент (client/dist)
 * - Админка (admin/dist)
 * - API (server/dist)
 * - WebSocket (Socket.io)
 * 
 * Запуск: node server.js
 * Порт: process.env.PORT || 3000
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// CORS configuration for production
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5174';
const allowedOrigins = [
  CLIENT_URL,
  ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean);

console.log('[CORS] Allowed origins:', allowedOrigins.join(', '));

// Socket.io setup with CORS
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
const clientDistPath = path.join(__dirname, 'client', 'dist');
const adminDistPath = path.join(__dirname, 'admin', 'dist');
const publicPath = path.join(__dirname, 'public');

console.log('[Static] Checking paths...');
console.log('  - client/dist:', fs.existsSync(clientDistPath));
console.log('  - admin/dist:', fs.existsSync(adminDistPath));
console.log('  - public:', fs.existsSync(publicPath));

// Serve admin panel from /admin
if (fs.existsSync(adminDistPath)) {
  console.log('[Static] Serving admin panel from admin/dist/');
  app.use('/admin', express.static(adminDistPath));
}

// Serve client from root (priority: client/dist > public)
if (fs.existsSync(clientDistPath)) {
  console.log('[Static] Serving client from client/dist/');
  app.use(express.static(clientDistPath));
} else if (fs.existsSync(publicPath)) {
  console.log('[Static] Serving client from public/');
  app.use(express.static(publicPath));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Nexora API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    clientAvailable: fs.existsSync(clientDistPath),
    adminAvailable: fs.existsSync(adminDistPath),
  });
});

// API routes placeholder
app.use('/api/v1', (req, res) => {
  res.status(200).json({
    message: 'Nexora API v1',
    note: 'Full API implementation in server/src/app.ts',
    endpoints: {
      auth: '/api/v1/auth',
      chat: '/api/v1/chat',
      user: '/api/v1/user',
      wallet: '/api/v1/wallet',
      nft: '/api/v1/nft',
      admin: '/api/v1/admin',
      ai: '/api/v1/ai',
    },
  });
});

// Admin panel fallback
app.use('/admin', (req, res, next) => {
  if (fs.existsSync(adminDistPath)) {
    const adminIndexPath = path.join(adminDistPath, 'index.html');
    if (fs.existsSync(adminIndexPath)) {
      console.log('[SPA] Serving admin/index.html for', req.path);
      return res.sendFile(adminIndexPath);
    }
  }
  next();
});

// SPA fallback - serve index.html for all non-API routes
app.use((req, res, next) => {
  // Skip API routes and health check
  if (req.path.startsWith('/api') || req.path === '/health') {
    return next();
  }

  // Try client/dist/index.html first
  const clientIndexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(clientIndexPath)) {
    console.log('[SPA] Serving client/dist/index.html for', req.path);
    return res.sendFile(clientIndexPath);
  }

  // Then try public/index.html
  const publicIndexPath = path.join(publicPath, 'index.html');
  if (fs.existsSync(publicIndexPath)) {
    console.log('[SPA] Serving public/index.html for', req.path);
    return res.sendFile(publicIndexPath);
  }

  // No index.html found
  console.log('[SPA] No index.html found for', req.path);
  res.status(404).json({
    error: 'Not Found',
    message: 'Client not found. Please build client: npm run build:client',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
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

  // Message broadcast
  socket.on('message', (data) => {
    console.log(`[WebSocket] Message from ${socket.id}:`, data);
    // Broadcast to all clients
    io.emit('message', {
      ...data,
      id: data.id || Date.now().toString(),
      time: Date.now(),
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

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║           🚀 Nexora Server Started             ║');
  console.log('╠════════════════════════════════════════════════╣');
  console.log(`║  Port:         ${PORT}`.padEnd(49) + '║');
  console.log(`║  Environment:  ${process.env.NODE_ENV || 'development'}`.padEnd(49) + '║');
  console.log(`║  Client URL:   ${CLIENT_URL}`.padEnd(49) + '║');
  console.log(`║  Admin URL:    ${ADMIN_URL}`.padEnd(49) + '║');
  console.log('╠════════════════════════════════════════════════╣');
  console.log('║  Static Files:                                 ║');
  console.log(`║    client/dist:  ${fs.existsSync(clientDistPath) ? '✓ Available' : '✗ Not built'}`.padEnd(49) + '║');
  console.log(`║    admin/dist:   ${fs.existsSync(adminDistPath) ? '✓ Available' : '✗ Not built'}`.padEnd(49) + '║');
  console.log(`║    public:       ${fs.existsSync(publicPath) ? '✓ Available' : '✗ Not found'}`.padEnd(49) + '║');
  console.log('╠════════════════════════════════════════════════╣');
  console.log('║  Endpoints:                                    ║');
  console.log('║    GET  /              - Client (React)' + ' '.repeat(18) + '║');
  console.log('║    GET  /admin         - Admin Panel' + ' '.repeat(22) + '║');
  console.log('║    GET  /health        - Health Check' + ' '.repeat(22) + '║');
  console.log('║    GET  /api/v1        - API v1' + ' '.repeat(28) + '║');
  console.log('║    WS   /socket.io/    - WebSocket' + ' '.repeat(24) + '║');
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
