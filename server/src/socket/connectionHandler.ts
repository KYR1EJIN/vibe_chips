/**
 * Connection lifecycle handler
 * Phase 0: Logs connect/disconnect events only
 * No room logic, no game state, no action handlers
 */

import { Socket, Server } from 'socket.io';

/**
 * Handles socket connection lifecycle
 * Phase 0: Only logs connection events
 */
export function connectionHandler(socket: Socket, io: Server): void {
  console.log(`✅ Client connected: ${socket.id}`);

  // Send connection confirmation
  socket.emit('connected', {
    socketId: socket.id,
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`❌ Client disconnected: ${socket.id}, reason: ${reason}`);
  });

  // Phase 0: No other handlers
  // Room handlers will be added in Phase 1
  // Player handlers will be added in Phase 2
  // Owner handlers will be added in Phase 4
}

