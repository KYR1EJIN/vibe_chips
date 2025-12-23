/**
 * Player action event handlers
 * Phase 1: Seating system (take_seat, leave_seat)
 */

import { Socket, Server } from 'socket.io';
import { stateManager } from '../game/state/stateManager';
import { PlayerState } from '../game/state/playerState';
import { generatePlayerId } from '../utils/idGenerator';
import {
  socketSchemas,
  TakeSeatPayload,
  LeaveSeatPayload,
  ActionAckPayload,
  ErrorPayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
} from '@vibe-chips/shared';
import { broadcastRoomState } from './roomHandlers';

/**
 * Handles player action events
 * Phase 1: take_seat, leave_seat
 */
export function setupPlayerHandlers(socket: Socket, io: Server): void {
  /**
   * take_seat: Player requests to take an empty seat
   */
  socket.on('take_seat', (payload: TakeSeatPayload) => {
    try {
      // Validate payload
      socketSchemas.take_seat.parse(payload);

      const { seatNumber, username, startingStack } = payload;

      // Get connection info
      const connection = stateManager.getConnection(socket.id);
      if (!connection || !connection.roomId) {
        const errorPayload: ErrorPayload = {
          code: 'NOT_IN_ROOM',
          message: 'You must join a room first',
          eventType: 'take_seat',
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

      const room = stateManager.getRoom(connection.roomId);
      if (!room) {
        const errorPayload: ErrorPayload = {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found',
          eventType: 'take_seat',
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

      // Check if player is already seated
      const existingPlayer = room.getPlayerBySocketId(socket.id);
      if (existingPlayer) {
        const errorPayload: ErrorPayload = {
          code: 'ALREADY_SEATED',
          message: 'You are already seated',
          eventType: 'take_seat',
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

      // Validate seat
      const seat = room.getSeat(seatNumber);
      if (!seat) {
        const errorPayload: ErrorPayload = {
          code: 'INVALID_SEAT',
          message: `Seat ${seatNumber} does not exist`,
          eventType: 'take_seat',
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

      if (seat.isOccupied) {
        const errorPayload: ErrorPayload = {
          code: 'SEAT_OCCUPIED',
          message: `Seat ${seatNumber} is already occupied`,
          eventType: 'take_seat',
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

      // Validate username uniqueness
      if (!room.isUsernameUnique(username)) {
        const errorPayload: ErrorPayload = {
          code: 'USERNAME_TAKEN',
          message: `Username "${username}" is already taken`,
          eventType: 'take_seat',
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

      // Validate starting stack
      if (startingStack <= 0) {
        const errorPayload: ErrorPayload = {
          code: 'INVALID_STACK',
          message: 'Starting stack must be greater than 0',
          eventType: 'take_seat',
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

      // Create player
      const playerId = generatePlayerId();
      const player = new PlayerState(
        playerId,
        socket.id,
        username,
        seatNumber,
        startingStack
      );

      // Add player to room
      room.addPlayer(player);

      // Update connection tracking
      stateManager.trackConnection(socket.id, {
        roomId: connection.roomId,
        playerId,
      });

      // Send success ack
      const ack: ActionAckPayload = {
        success: true,
        eventId: `evt_${Date.now()}`,
      };
      socket.emit('action_ack', ack);

      // Broadcast room state to all clients
      broadcastRoomState(io, connection.roomId, room);

      // Broadcast player_joined to all other clients
      const joinedPayload: PlayerJoinedPayload = {
        player: player.toJSON(),
        seatNumber,
      };
      socket.to(connection.roomId).emit('player_joined', joinedPayload);

      console.log(
        `✅ Player ${username} (${playerId}) took seat ${seatNumber} in room ${connection.roomId}`
      );
    } catch (error: any) {
      const errorPayload: ErrorPayload = {
        code: 'VALIDATION_ERROR',
        message: error.message || 'Invalid request',
        eventType: 'take_seat',
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
   * leave_seat: Player requests to leave their seat
   */
  socket.on('leave_seat', (payload: LeaveSeatPayload) => {
    try {
      // Validate payload (empty in Phase 1)
      socketSchemas.leave_seat.parse(payload);

      // Get connection info
      const connection = stateManager.getConnection(socket.id);
      if (!connection || !connection.roomId) {
        const errorPayload: ErrorPayload = {
          code: 'NOT_IN_ROOM',
          message: 'You must join a room first',
          eventType: 'leave_seat',
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

      const room = stateManager.getRoom(connection.roomId);
      if (!room) {
        const errorPayload: ErrorPayload = {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found',
          eventType: 'leave_seat',
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

      // Find player by socket ID
      const player = room.getPlayerBySocketId(socket.id);
      if (!player) {
        const errorPayload: ErrorPayload = {
          code: 'NOT_SEATED',
          message: 'You are not seated',
          eventType: 'leave_seat',
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

      // Phase 1: Allow leaving seat (Phase 5+: May need owner approval if chips in play)
      const seatNumber = player.seatNumber;
      const playerId = player.playerId;

      // Remove player from room
      room.removePlayer(playerId);

      // Update connection tracking
      stateManager.trackConnection(socket.id, {
        roomId: connection.roomId,
      });

      // Send success ack
      const ack: ActionAckPayload = {
        success: true,
        eventId: `evt_${Date.now()}`,
      };
      socket.emit('action_ack', ack);

      // Broadcast room state to all clients
      broadcastRoomState(io, connection.roomId, room);

      // Broadcast player_left to all clients
      const leftPayload: PlayerLeftPayload = {
        playerId,
        seatNumber,
        reason: 'voluntary',
      };
      io.to(connection.roomId).emit('player_left', leftPayload);

      console.log(
        `✅ Player ${playerId} left seat ${seatNumber} in room ${connection.roomId}`
      );
    } catch (error: any) {
      const errorPayload: ErrorPayload = {
        code: 'VALIDATION_ERROR',
        message: error.message || 'Invalid request',
        eventType: 'leave_seat',
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


