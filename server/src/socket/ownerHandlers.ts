/**
 * Owner action event handlers
 * Phase 1: owner_update_config (basic room configuration)
 */

import { Socket, Server } from 'socket.io';
import { stateManager } from '../game/state/stateManager';
import {
  socketSchemas,
  OwnerUpdateConfigPayload,
  ActionAckPayload,
  ErrorPayload,
} from '@vibe-chips/shared';
import { broadcastRoomState } from './roomHandlers';

/**
 * Handles owner-only action events
 * Phase 1: owner_update_config
 */
export function setupOwnerHandlers(socket: Socket, io: Server): void {
  /**
   * owner_update_config: Owner updates room configuration
   * Phase 1: Only blinds, no gameplay effect yet
   */
  socket.on('owner_update_config', (payload: OwnerUpdateConfigPayload) => {
    try {
      // Validate payload
      socketSchemas.owner_update_config.parse(payload);

      // Get connection info
      const connection = stateManager.getConnection(socket.id);
      if (!connection || !connection.roomId) {
        const errorPayload: ErrorPayload = {
          code: 'NOT_IN_ROOM',
          message: 'You must join a room first',
          eventType: 'owner_update_config',
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
          eventType: 'owner_update_config',
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

      // Check if user is owner
      if (room.ownerId !== socket.id) {
        const errorPayload: ErrorPayload = {
          code: 'OWNER_ONLY',
          message: 'Only the room owner can update configuration',
          eventType: 'owner_update_config',
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

      // Phase 1: Config can be updated at any time (no active hand yet)

      // Validate bigBlind = 2x smallBlind if both provided
      if (payload.smallBlind !== undefined && payload.bigBlind !== undefined) {
        if (payload.bigBlind !== payload.smallBlind * 2) {
          const errorPayload: ErrorPayload = {
            code: 'INVALID_BLINDS',
            message: 'Big blind must be exactly 2x small blind',
            eventType: 'owner_update_config',
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
      }

      // Update room config
      const updates: any = {};
      if (payload.smallBlind !== undefined) {
        updates.smallBlind = payload.smallBlind;
        // Enforce bigBlind = 2x smallBlind
        updates.bigBlind = payload.smallBlind * 2;
      } else if (payload.bigBlind !== undefined) {
        updates.bigBlind = payload.bigBlind;
        // Enforce smallBlind = bigBlind / 2
        updates.smallBlind = payload.bigBlind / 2;
      }
      if (payload.maxSeats !== undefined) {
        updates.maxSeats = payload.maxSeats;
      }

      room.updateConfig(updates);

      // Send success ack
      const ack: ActionAckPayload = {
        success: true,
        eventId: `evt_${Date.now()}`,
      };
      socket.emit('action_ack', ack);

      // Broadcast room state to all clients
      broadcastRoomState(io, connection.roomId, room);

      console.log(
        `✅ Owner ${socket.id} updated config in room ${connection.roomId}`
      );
    } catch (error: any) {
      const errorPayload: ErrorPayload = {
        code: 'VALIDATION_ERROR',
        message: error.message || 'Invalid request',
        eventType: 'owner_update_config',
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


