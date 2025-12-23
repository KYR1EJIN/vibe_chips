/**
 * Connection lifecycle handler
 * Phase 1: Connection tracking and cleanup
 */

import { Socket, Server } from 'socket.io';
import { stateManager } from '../game/state/stateManager';
import { setupRoomHandlers } from './roomHandlers';
import { setupPlayerHandlers } from './playerHandlers';
import { setupOwnerHandlers } from './ownerHandlers';

/**
 * Handles socket connection lifecycle
 * Phase 1: Connection tracking, room handlers, player handlers, owner handlers
 */
export function connectionHandler(socket: Socket, io: Server): void {
  console.log(`✅ Client connected: ${socket.id}`);

  // Send connection confirmation
  socket.emit('connected', {
    socketId: socket.id,
  });

  // Setup event handlers
  setupRoomHandlers(socket, io);
  setupPlayerHandlers(socket, io);
  setupOwnerHandlers(socket, io);

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`❌ Client disconnected: ${socket.id}, reason: ${reason}`);

    // Get connection info
    const connection = stateManager.getConnection(socket.id);
    if (connection) {
      const room = stateManager.getRoom(connection.roomId);
      if (room && connection.playerId) {
        // Mark player as disconnected
        const player = room.getPlayer(connection.playerId);
        if (player) {
          player.markDisconnected();
          // Phase 1: Don't remove player on disconnect
          // Phase 5+: May preserve state if chips in play
        }
      }

      // Remove connection tracking
      stateManager.removeConnection(socket.id);
    }
  });
}

