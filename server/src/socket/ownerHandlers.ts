/**
 * Owner action event handlers
 * Phase 1: owner_update_config (basic room configuration)
 */

import { Socket, Server } from 'socket.io';
import { stateManager } from '../game/state/stateManager';
import { HandState } from '../game/state/handState';
import {
  socketSchemas,
  OwnerUpdateConfigPayload,
  OwnerStartHandPayload,
  ActionAckPayload,
  ErrorPayload,
  HandStartedPayload,
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

  /**
   * owner_start_hand: Owner starts a new hand
   * Phase 2: Creates hand, initializes preflop betting round
   */
  socket.on('owner_start_hand', (payload: OwnerStartHandPayload) => {
    try {
      // Validate payload
      socketSchemas.owner_start_hand.parse(payload);

      // Get connection info
      const connection = stateManager.getConnection(socket.id);
      if (!connection || !connection.roomId) {
        const errorPayload: ErrorPayload = {
          code: 'NOT_IN_ROOM',
          message: 'You must join a room first',
          eventType: 'owner_start_hand',
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
          eventType: 'owner_start_hand',
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
          message: 'Only the room owner can start a hand',
          eventType: 'owner_start_hand',
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

      // Validate: Must have at least 2 players seated
      const seatedPlayers = Array.from(room.players.values());
      if (seatedPlayers.length < 2) {
        const errorPayload: ErrorPayload = {
          code: 'INSUFFICIENT_PLAYERS',
          message: 'At least 2 players must be seated to start a hand',
          eventType: 'owner_start_hand',
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

      // Validate: No active hand
      if (room.currentHand !== null) {
        const errorPayload: ErrorPayload = {
          code: 'HAND_ALREADY_ACTIVE',
          message: 'A hand is already active',
          eventType: 'owner_start_hand',
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

      // Phase 2: Simple hand initialization with blind posting
      // For now, assign dealer button to first seated player
      // In Phase 4, this will rotate properly
      const firstPlayer = seatedPlayers[0];
      const dealerButtonSeat = firstPlayer.seatNumber;
      
      // Calculate small blind and big blind seats (left of dealer, left of small blind)
      const getNextSeat = (seat: number): number => {
        return seat === room.config.maxSeats ? 1 : seat + 1;
      };
      const smallBlindSeat = getNextSeat(dealerButtonSeat);
      const bigBlindSeat = getNextSeat(smallBlindSeat);
      
      // First action seat is left of big blind
      const firstActionSeat = getNextSeat(bigBlindSeat);

      // Set all seated players to active status and reset currentBet
      for (const player of seatedPlayers) {
        player.status = 'active';
        player.resetCurrentBet();
      }

      // Post blinds: Small blind and big blind
      const smallBlindPlayer = room.getPlayerBySeatNumber(smallBlindSeat);
      const bigBlindPlayer = room.getPlayerBySeatNumber(bigBlindSeat);

      if (smallBlindPlayer) {
        const smallBlindAmount = Math.min(smallBlindPlayer.stack, room.config.smallBlind);
        smallBlindPlayer.stack -= smallBlindAmount;
        smallBlindPlayer.currentBet = smallBlindAmount;
        // If player went all-in for small blind, mark as all-in
        if (smallBlindPlayer.stack === 0 && smallBlindAmount > 0) {
          smallBlindPlayer.status = 'all-in';
        }
      }

      if (bigBlindPlayer) {
        const bigBlindAmount = Math.min(bigBlindPlayer.stack, room.config.bigBlind);
        bigBlindPlayer.stack -= bigBlindAmount;
        bigBlindPlayer.currentBet = bigBlindAmount;
        // If player went all-in for big blind, mark as all-in
        if (bigBlindPlayer.stack === 0 && bigBlindAmount > 0) {
          bigBlindPlayer.status = 'all-in';
        }
      }

      // Create hand state (after blinds posted)
      const hand = new HandState(
        dealerButtonSeat,
        smallBlindSeat,
        bigBlindSeat,
        firstActionSeat,
        room.config.bigBlind
      );

      // Assign hand to room
      room.currentHand = hand;

      // Send success ack
      const ack: ActionAckPayload = {
        success: true,
        eventId: `evt_${Date.now()}`,
      };
      socket.emit('action_ack', ack);

      // Broadcast room state to all clients
      broadcastRoomState(io, connection.roomId, room);

      // Broadcast hand_started to all clients
      const handStartedPayload: HandStartedPayload = {
        handId: hand.handId,
        dealerButtonSeat,
        smallBlindSeat,
        bigBlindSeat,
      };
      io.to(connection.roomId).emit('hand_started', handStartedPayload);

      console.log(
        `✅ Owner ${socket.id} started hand ${hand.handId} in room ${connection.roomId}`
      );
    } catch (error: any) {
      const errorPayload: ErrorPayload = {
        code: 'VALIDATION_ERROR',
        message: error.message || 'Invalid request',
        eventType: 'owner_start_hand',
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


