// server.js - Nexora Production Entry Point for Render
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'nexora',
    version: '1.0.0'
  });
});

// Import and start the main server application
if (process.env.NODE_ENV === 'production') {
  // In production, try to start the compiled server
  try {
    const serverApp = require('./server/dist/app.js');
    console.log('✅ Production server loaded from ./server/dist/app.js');
  } catch (error) {
    console.error('❌ Failed to load production server:', error.message);
    
    // Fallback: serve static files if server fails
    console.log('🔄 Falling back to static file serving...');
    
    // Serve client build files
    const clientBuildPath = path.join(__dirname, 'client', 'dist');
    app.use(express.static(clientBuildPath));
    
    // API routes fallback
    app.use('/api/v1', (req, res) => {
      res.status(503).json({ 
        error: 'Backend service temporarily unavailable',
        message: 'Please check server configuration',
        timestamp: new Date().toISOString()
      });
    });
    
    // Serve index.html for all routes (SPA fallback)
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
    
    // Start fallback server
    app.listen(PORT, () => {
      console.log(`🚀 Fallback server running on port ${PORT}`);
      console.log(`📱 Frontend: http://localhost:${PORT}`);
      console.log(`⚠️  Backend: Service unavailable`);
    });
  }
} else {
  // Development mode
  console.log('🔧 Development mode - use npm run dev instead');
  app.get('*', (req, res) => {
    res.json({
      message: 'Nexora Development Server',
      note: 'Use "npm run dev" for development mode',
      ports: {
        backend: 5000,
        frontend: 5173
      }
    });
  });
  
  app.listen(PORT, () => {
    console.log(`🔧 Development entry point on port ${PORT}`);
    console.log(`💡 Run "npm run dev" to start both backend and frontend`);
  });
}
