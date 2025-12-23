/**
 * Player types
 * Phase 1: Basic player state for seating
 */

import { PlayerStatus } from './room';

export type PlayerId = string;

/**
 * Player interface
 * Phase 1: Basic player fields for seating
 */
export interface Player {
  playerId: PlayerId;
  socketId: string; // Current socket connection ID
  username: string; // Display name (unique per room)
  seatNumber: number; // Seat position (1-10)
  stack: number; // Current chip count
  status: PlayerStatus; // active | folded | all-in | sitting-out | disconnected
  isConnected: boolean; // Whether socket is currently connected
  joinedAt: number; // Timestamp when player took seat
}

