/**
 * Turn order management
 * Phase 2: Calculates next action seat and detects betting round completion
 */

import { PlayerState } from '../state/playerState';
import { BettingRoundState } from '../state/bettingRoundState';
import { RoomState } from '../state/roomState';

/**
 * TurnOrderManager class
 * Manages turn order and betting round completion
 * Phase 2: Preflop betting only
 */
export class TurnOrderManager {
  /**
   * Get next action seat
   * Phase 2: Skips folded and all-in players, wraps around table
   */
  public static getNextActionSeat(
    currentSeat: number,
    room: RoomState,
    bettingRound: BettingRoundState
  ): number | null {
    const maxSeats = room.config.maxSeats;
    let nextSeat = currentSeat;

    // Try up to maxSeats times to find next active player
    for (let i = 0; i < maxSeats; i++) {
      // Move to next seat (wrap around)
      nextSeat = nextSeat === maxSeats ? 1 : nextSeat + 1;

      const seat = room.getSeat(nextSeat);
      if (!seat || !seat.isOccupied || !seat.playerId) {
        continue;
      }

      const player = room.getPlayer(seat.playerId);
      if (!player) {
        continue;
      }

      // Skip folded and all-in players
      if (player.status === 'folded' || player.status === 'all-in') {
        continue;
      }

      // Found an active player
      return nextSeat;
    }

    // No active players found
    return null;
  }

  /**
   * Check if betting round is complete
   * Phase 2: All active players called highest bet OR all but one folded OR all active players all-in
   */
  public static isBettingRoundComplete(
    room: RoomState,
    bettingRound: BettingRoundState
  ): boolean {
    const activePlayers: PlayerState[] = [];
    let foldedCount = 0;
    let allInCount = 0;

    // Count active, folded, and all-in players
    for (const player of room.players.values()) {
      if (player.status === 'active') {
        activePlayers.push(player);
      } else if (player.status === 'folded') {
        foldedCount++;
      } else if (player.status === 'all-in') {
        allInCount++;
      }
    }

    // Case 1: All but one folded
    const totalPlayers = activePlayers.length + foldedCount + allInCount;
    if (foldedCount === totalPlayers - 1) {
      return true;
    }

    // Case 2: All active players are all-in
    if (activePlayers.length === 0 && allInCount > 0) {
      return true;
    }

    // Case 3: All active players have called the highest bet
    if (activePlayers.length > 0) {
      const allCalled = activePlayers.every((player) => {
        return player.currentBet === bettingRound.highestBet;
      });
      if (allCalled) {
        return true;
      }
    }

    return false;
  }

  /**
   * Update action seat after an action
   * Phase 2: Calculates next action seat or marks round complete
   */
  public static updateActionSeat(
    room: RoomState,
    bettingRound: BettingRoundState
  ): void {
    // Check if betting round is complete
    if (this.isBettingRoundComplete(room, bettingRound)) {
      bettingRound.markComplete();
      return;
    }

    // Find next action seat
    if (bettingRound.actionSeat === null) {
      return; // Already complete
    }

    const nextSeat = this.getNextActionSeat(
      bettingRound.actionSeat,
      room,
      bettingRound
    );

    if (nextSeat === null) {
      // No more active players, round is complete
      bettingRound.markComplete();
    } else {
      bettingRound.actionSeat = nextSeat;
    }
  }
}

