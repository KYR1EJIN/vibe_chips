/**
 * Room event handlers
 * Phase 1: Room creation and joining
 */

import { Socket, Server } from 'socket.io';
import { stateManager } from '../game/state/stateManager';
import { generateRoomId } from '../utils/idGenerator';
import {
  socketSchemas,
  CreateRoomPayload,
  JoinRoomPayload,
  RoomStatePayload,
  RoomCreatedPayload,
  ActionAckPayload,
  ErrorPayload,
} from '@vibe-chips/shared';

/**
 * Broadcast room state to all clients in room
 */
function broadcastRoomState(io: Server, roomId: string, room: any): void {
  const socketIds = stateManager.getRoomSocketIds(roomId);
  const payload: RoomStatePayload = {
    room: room.toJSON ? room.toJSON() : room,
  };
  socketIds.forEach((socketId) => {
    io.to(socketId).emit('room_state', payload);
  });
}

/**
 * Handles room-related events
 * Phase 1: create_room, join_room
 */
export function setupRoomHandlers(socket: Socket, io: Server): void {
  /**
   * create_room: Client requests to create a new room
   */
  socket.on('create_room', (payload: CreateRoomPayload) => {
    try {
      // Validate payload (empty in Phase 1)
      socketSchemas.create_room.parse(payload);

      // Generate room ID
      let roomId = generateRoomId();
      // Ensure uniqueness (very unlikely collision, but check anyway)
      while (stateManager.hasRoom(roomId)) {
        roomId = generateRoomId();
      }

      // Create room
      const room = stateManager.createRoom(roomId, socket.id);

      // Track connection
      stateManager.trackConnection(socket.id, { roomId });

      // Join socket room for broadcasting
      socket.join(roomId);

      // Send room_created event
      const createdPayload: RoomCreatedPayload = { roomId };
      socket.emit('room_created', createdPayload);

      // Send full room state
      const statePayload: RoomStatePayload = {
        room: room.toJSON(),
      };
      socket.emit('room_state', statePayload);

      // Send success ack
      const ack: ActionAckPayload = {
        success: true,
        eventId: `evt_${Date.now()}`,
      };
      socket.emit('action_ack', ack);

      console.log(`✅ Room created: ${roomId} by ${socket.id}`);
    } catch (error: any) {
      const errorPayload: ErrorPayload = {
        code: 'VALIDATION_ERROR',
        message: error.message || 'Invalid request',
        eventType: 'create_room',
      };
      socket.emit('error', errorPayload);
      socket.emit('action_ack', {
        success: false,
        error: {
          code: errorPayload.code,
          message: errorPayload.message,
        },
      });
    }
  });

  /**
   * join_room: Client requests to join a room
   */
  socket.on('join_room', (payload: JoinRoomPayload) => {
    try {
      // Validate payload
      socketSchemas.join_room.parse(payload);

      const { roomId, playerId } = payload;

      // Check if room exists
      const room = stateManager.getRoom(roomId);
      if (!room) {
        const errorPayload: ErrorPayload = {
          code: 'ROOM_NOT_FOUND',
          message: `Room ${roomId} does not exist`,
          eventType: 'join_room',
        };
        socket.emit('error', errorPayload);
        socket.emit('action_ack', {
          success: false,
          error: {
            code: errorPayload.code,
            message: errorPayload.message,
          },
        });
        return;
      }

      // Track connection
      stateManager.trackConnection(socket.id, { roomId, playerId });

      // Join socket room for broadcasting
      socket.join(roomId);

      // If reconnecting as existing player, update their socket ID
      if (playerId) {
        const player = room.getPlayer(playerId);
        if (player) {
          player.updateSocketId(socket.id);
        }
      }

      // Send full room state
      const statePayload: RoomStatePayload = {
        room: room.toJSON(),
      };
      socket.emit('room_state', statePayload);

      // Send success ack
      const ack: ActionAckPayload = {
        success: true,
        eventId: `evt_${Date.now()}`,
      };
      socket.emit('action_ack', ack);

      console.log(`✅ Client ${socket.id} joined room ${roomId}`);
    } catch (error: any) {
      const errorPayload: ErrorPayload = {
        code: 'VALIDATION_ERROR',
        message: error.message || 'Invalid request',
        eventType: 'join_room',
      };
      socket.emit('error', errorPayload);
      socket.emit('action_ack', {
        success: false,
        error: {
          code: errorPayload.code,
          message: errorPayload.message,
        },
      });
    }
  });
}

/**
 * Export broadcast function for use in other handlers
 */
export { broadcastRoomState };


