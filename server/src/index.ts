/**
 * Server entry point
 * Phase 0: Basic Express + Socket.io setup only
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocketServer } from './socket/socketServer';
import path from 'path';

const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);

// Basic middleware
app.use(express.json());

// Health check route (must be before static file serving)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from client build in production
if (process.env.NODE_ENV === 'production') {
  // Railway runs from project root, so client/dist is relative to project root
  const clientDistPath = path.join(process.cwd(), 'client', 'dist');
  
  app.use(express.static(clientDistPath));
  
  // Serve index.html for all non-API routes (SPA routing)
  // This must be last to catch all other routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Initialize Socket.io
// Support multiple origins for production (client and server may be on different domains)
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173'];

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Setup socket handlers (connection lifecycle only in Phase 0)
setupSocketServer(io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server initialized`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

