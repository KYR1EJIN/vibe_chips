/**
 * Socket.io server setup
 * Phase 0: Connection lifecycle logging only
 * No room creation, no game state, no handlers beyond connect/disconnect
 */

import { Server } from 'socket.io';
import { connectionHandler } from './connectionHandler';

/**
 * Sets up Socket.io server with connection handlers
 * Phase 0: Only handles connection/disconnection logging
 */
export function setupSocketServer(io: Server): void {
  io.on('connection', (socket) => {
    connectionHandler(socket, io);
  });
}

