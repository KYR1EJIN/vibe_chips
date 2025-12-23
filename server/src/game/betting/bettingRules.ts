/**
 * Betting rules engine
 * Phase 2: Texas Hold'em betting rules (preflop only)
 */

import { ActionType } from '@vibe-chips/shared';
import { PlayerState } from '../state/playerState';
import { BettingRoundState } from '../state/bettingRoundState';

/**
 * BettingRules class
 * Enforces Texas Hold'em betting rules
 * Phase 2: Preflop betting only
 */
export class BettingRules {
  /**
   * Get minimum bet amount
   * Phase 2: Minimum bet = big blind
   */
  public static getMinimumBet(bigBlind: number): number {
    return bigBlind;
  }

  /**
   * Get minimum raise amount
   * Phase 2: Minimum raise = size of last raise (or big blind if no raises)
   */
  public static getMinimumRaise(bettingRound: BettingRoundState): number {
    return bettingRound.minimumRaise;
  }

  /**
   * Check if action is legal for current state
   * Phase 2: Validates action legality
   */
  public static isActionLegal(
    action: ActionType,
    player: PlayerState,
    bettingRound: BettingRoundState,
    bigBlind: number
  ): { legal: boolean; reason?: string } {
    const amountToCall = bettingRound.highestBet - player.currentBet;

    switch (action) {
      case 'check':
        // Can only check if there's no bet to call
        if (amountToCall > 0) {
          return { legal: false, reason: 'Cannot check when there is a bet to call' };
        }
        return { legal: true };

      case 'call':
        // Can only call if there's a bet to call
        if (amountToCall === 0) {
          return { legal: false, reason: 'Cannot call when there is no bet to call (use check instead)' };
        }
        // Must have enough stack to call
        if (player.stack < amountToCall) {
          return { legal: false, reason: 'Insufficient stack to call' };
        }
        return { legal: true };

      case 'bet':
        // Can only bet if there's no bet to call (first action)
        if (amountToCall > 0) {
          return { legal: false, reason: 'Cannot bet when there is a bet to call (use raise instead)' };
        }
        // Bet must be at least big blind
        // Note: Amount validation happens in ActionValidator
        return { legal: true };

      case 'raise':
        // Can only raise if there's a bet to call
        if (amountToCall === 0) {
          return { legal: false, reason: 'Cannot raise when there is no bet to call (use bet instead)' };
        }
        // Note: Amount validation happens in ActionValidator
        return { legal: true };

      case 'fold':
        // Can always fold
        return { legal: true };

      case 'all-in':
        // Can always go all-in (if stack > 0)
        if (player.stack === 0) {
          return { legal: false, reason: 'Cannot go all-in with zero stack' };
        }
        return { legal: true };

      default:
        return { legal: false, reason: 'Unknown action type' };
    }
  }

  /**
   * Check if all-in below minimum raise reopens action
   * Phase 2: All-in below minimum raise does NOT reopen action
   */
  public static doesAllInReopenAction(
    allInAmount: number,
    previousBet: number,
    minimumRaise: number
  ): boolean {
    const raiseAmount = allInAmount - previousBet;
    // All-in below minimum raise does NOT reopen action
    return raiseAmount >= minimumRaise;
  }
}

