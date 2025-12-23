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

import { Hand } from './hand';
import { Seat } from './seat';
import { Player } from './player';

/**
 * Room state interface
 * Phase 2: Added currentHand for betting engine
 */
export interface RoomState {
  roomId: RoomId;
  ownerId: string; // Socket ID of room creator
  createdAt: number;
  config: RoomConfig;
  seats: Seat[];
  players: Map<string, Player> | Record<string, Player>; // playerId -> Player
  currentHand: Hand | null; // Active hand, or null if in lobby (Phase 2)
}

