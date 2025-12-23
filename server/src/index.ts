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

/* ------------------ STATIC CLIENT ------------------ */

// IMPORTANT: resolve path correctly for Railway monorepo layout
// When compiled, server runs from server/dist/index.js
// So we need to go up two levels to reach project root, then into client/dist
const clientDistPath = path.resolve(__dirname, '../../client/dist');

// Serve static assets
app.use(express.static(clientDistPath));

// SPA fallback (React Router support) - must be last
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

/* -------------------------------------------------- */

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

