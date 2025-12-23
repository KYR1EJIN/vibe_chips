/**
 * Room types
 * Phase 1: Room creation, joining, and seating
 */

export type RoomId = string;

export type PlayerStatus = 'active' | 'folded' | 'all-in' | 'sitting-out' | 'disconnected';

export interface RoomConfig {
  smallBlind: number;
  bigBlind: number;
  maxSeats: number;
}

/**
 * Room state interface
 * Phase 1: Basic room state with seats and players
 */
export interface RoomState {
  roomId: RoomId;
  ownerId: string; // Socket ID of room creator
  createdAt: number;
  config: RoomConfig;
  seats: Seat[];
  players: Map<string, Player> | Record<string, Player>; // playerId -> Player
}

