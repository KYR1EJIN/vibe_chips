/**
 * Connection lifecycle handler
 * Phase 1: Connection tracking and cleanup
 */

import { Socket, Server } from 'socket.io';
import { stateManager } from '../game/state/stateManager';
import { setupRoomHandlers, broadcastRoomState } from './roomHandlers';
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
    if (connection && connection.roomId) {
      const room = stateManager.getRoom(connection.roomId);
      if (room && connection.playerId) {
        // Find player by playerId
        const player = room.getPlayer(connection.playerId);
        if (player) {
          // Phase 2: Free seat on disconnect
          // Phase 5+: May preserve seat if chips in play during active hand
          const seatNumber = player.seatNumber;
          
          // Free the seat - remove player from room
          room.removePlayer(connection.playerId);
          
          // Broadcast updated room state
          broadcastRoomState(io, connection.roomId, room);
          
          // Broadcast player_left event
          io.to(connection.roomId).emit('player_left', {
            playerId: connection.playerId,
            seatNumber,
            reason: 'disconnected',
          });
          
          console.log(`✅ Freed seat ${seatNumber} for disconnected player ${connection.playerId}`);
        }
      }

      // Remove connection tracking
      stateManager.removeConnection(socket.id);
    }
  });
}

