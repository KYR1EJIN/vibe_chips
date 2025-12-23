/**
 * Seat types
 * Phase 1: Seat occupancy tracking
 */

export interface Seat {
  seatNumber: number; // Position at table (1-10)
  isOccupied: boolean; // Whether seat has a player
  playerId: string | null; // Assigned player ID, or null if empty
}

