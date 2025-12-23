/**
 * Action validator
 * Phase 2: Validates player actions before processing
 */

import { ActionType } from '@vibe-chips/shared';
import { PlayerState } from '../state/playerState';
import { BettingRoundState } from '../state/bettingRoundState';
import { RoomState } from '../state/roomState';
import { BettingRules } from './bettingRules';

/**
 * ActionValidator class
 * Validates actions against game rules and state
 * Phase 2: Preflop betting only
 */
export class ActionValidator {
  /**
   * Validate a player action
   * Phase 2: Comprehensive validation
   */
  public static validateAction(
    player: PlayerState,
    action: ActionType,
    amount: number | undefined,
    room: RoomState,
    bettingRound: BettingRoundState
  ): { valid: boolean; error?: string } {
    // 1. Check if it's player's turn
    if (bettingRound.actionSeat !== player.seatNumber) {
      return { valid: false, error: 'Not your turn' };
    }

    // 2. Check if player is active
    if (player.status !== 'active') {
      return { valid: false, error: `Cannot act when status is ${player.status}` };
    }

    // 3. Check if hand is active
    if (!room.currentHand) {
      return { valid: false, error: 'No active hand' };
    }

    // 4. Check if betting round is active
    if (bettingRound.isComplete) {
      return { valid: false, error: 'Betting round is complete' };
    }

    // 5. Check action legality
    const legalityCheck = BettingRules.isActionLegal(
      action,
      player,
      bettingRound,
      room.config.bigBlind
    );
    if (!legalityCheck.legal) {
      return { valid: false, error: legalityCheck.reason || 'Action is not legal' };
    }

    // 6. Validate amount for actions that require it
    const amountToCall = bettingRound.highestBet - player.currentBet;

    switch (action) {
      case 'bet':
        if (amount === undefined || amount <= 0) {
          return { valid: false, error: 'Bet amount is required and must be greater than 0' };
        }
        if (amount < room.config.bigBlind) {
          return { valid: false, error: `Bet must be at least ${room.config.bigBlind} (big blind)` };
        }
        if (amount > player.stack) {
          return { valid: false, error: 'Bet amount exceeds stack (use all-in instead)' };
        }
        break;

      case 'raise':
        if (amount === undefined || amount <= 0) {
          return { valid: false, error: 'Raise amount is required and must be greater than 0' };
        }
        const totalRaiseAmount = amount - player.currentBet;
        if (totalRaiseAmount < bettingRound.minimumRaise) {
          return { valid: false, error: `Raise must be at least ${bettingRound.minimumRaise} more than current bet` };
        }
        if (amount > player.stack + player.currentBet) {
          return { valid: false, error: 'Raise amount exceeds available chips (use all-in instead)' };
        }
        break;

      case 'all-in':
        // All-in uses entire stack, amount is optional (ignored if provided)
        if (player.stack === 0) {
          return { valid: false, error: 'Cannot go all-in with zero stack' };
        }
        break;

      case 'call':
        // Call uses amountToCall, validate player has enough
        if (player.stack < amountToCall) {
          return { valid: false, error: 'Insufficient stack to call' };
        }
        break;

      case 'check':
      case 'fold':
        // No amount validation needed
        break;

      default:
        return { valid: false, error: 'Unknown action type' };
    }

    return { valid: true };
  }
}

