/**
 * Server entry point
 * Phase 0: Basic Express + Socket.io setup only
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocketServer } from './socket/socketServer';

const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);

// Basic middleware
app.use(express.json());

// Health check route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
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

