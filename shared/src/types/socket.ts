/**
 * Socket.io event types
 * Phase 1: Room creation, joining, and seating events
 */

import { RoomState, RoomId } from './room';
import { Player, PlayerId } from './player';
import { ActionType } from './action';

// ============================================================================
// Client → Server Events
// ============================================================================

export interface CreateRoomPayload {
  // No payload needed, room ID generated server-side
}

export interface JoinRoomPayload {
  roomId: RoomId;
  playerId?: PlayerId; // Optional: for reconnection
}

export interface TakeSeatPayload {
  seatNumber: number; // 1-10
  username: string; // Must be unique per room
  startingStack: number; // Must be > 0
}

export interface LeaveSeatPayload {
  // No payload needed, playerId from socket connection
}

export interface OwnerUpdateConfigPayload {
  smallBlind?: number;
  bigBlind?: number;
  maxSeats?: number;
}

export interface OwnerStartHandPayload {
  // No payload needed, uses current room state
}

export interface PlayerActionPayload {
  action: ActionType;
  amount?: number; // Required for bet/raise, optional for all-in
}

// ============================================================================
// Server → Client Events
// ============================================================================

export interface RoomStatePayload {
  room: RoomState;
}

export interface ActionAckPayload {
  success: boolean;
  eventId?: string; // If successful, the event ID created
  error?: {
    code: string;
    message: string;
  };
}

export interface RoomCreatedPayload {
  roomId: RoomId;
}

export interface PlayerJoinedPayload {
  player: Player;
  seatNumber: number;
}

export interface PlayerLeftPayload {
  playerId: PlayerId;
  seatNumber: number;
  reason: 'voluntary' | 'disconnected' | 'kicked';
}

export interface ConnectedPayload {
  socketId: string;
  roomId?: RoomId; // If reconnecting to existing room
  playerId?: PlayerId; // If reconnecting as existing player
}

export interface ErrorPayload {
  code: string; // e.g., "NOT_YOUR_TURN", "INVALID_AMOUNT", "OWNER_ONLY"
  message: string;
  eventType?: string; // The event that caused the error
}

export interface HandStartedPayload {
  handId: string;
  dealerButtonSeat: number;
  smallBlindSeat: number;
  bigBlindSeat: number;
}

