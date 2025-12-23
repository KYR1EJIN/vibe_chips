/**
 * Action processor
 * Phase 2: Processes validated actions and updates state
 */

import { ActionType, Action } from '@vibe-chips/shared';
import { PlayerState } from '../state/playerState';
import { BettingRoundState } from '../state/bettingRoundState';
import { RoomState } from '../state/roomState';
import { generateId } from '../../utils/idGenerator';
import { BettingRules } from './bettingRules';

/**
 * ActionProcessor class
 * Processes actions and updates game state
 * Phase 2: Preflop betting only
 */
export class ActionProcessor {
  /**
   * Process a player action
   * Phase 2: Updates player state, betting round state
   */
  public static processAction(
    player: PlayerState,
    action: ActionType,
    amount: number | undefined,
    room: RoomState,
    bettingRound: BettingRoundState
  ): Action {
    const previousBet = player.currentBet;
    const previousStack = player.stack;
    let actionAmount = 0;

    switch (action) {
      case 'bet':
        // Bet: Set new bet amount
        actionAmount = amount!;
        player.currentBet = actionAmount;
        player.stack -= actionAmount;
        bettingRound.updateHighestBet(actionAmount, previousBet);
        break;

      case 'raise':
        // Raise: Increase bet to new amount
        actionAmount = amount!;
        const totalContribution = actionAmount - previousBet;
        player.currentBet = actionAmount;
        player.stack -= totalContribution;
        bettingRound.updateHighestBet(actionAmount, previousBet);
        break;

      case 'call':
        // Call: Match the highest bet
        actionAmount = bettingRound.highestBet - previousBet;
        player.currentBet = bettingRound.highestBet;
        player.stack -= actionAmount;
        // Check if player went all-in
        if (player.stack === 0 && actionAmount > 0) {
          player.status = 'all-in';
        }
        break;

      case 'check':
        // Check: No action, no chips moved
        actionAmount = 0;
        break;

      case 'fold':
        // Fold: Player is out of the hand
        actionAmount = 0;
        player.status = 'folded';
        break;

      case 'all-in':
        // All-in: Bet entire stack
        actionAmount = player.stack;
        const newBet = previousBet + actionAmount;
        player.currentBet = newBet;
        player.stack = 0;
        player.status = 'all-in';
        bettingRound.updateHighestBet(newBet, previousBet);
        break;
    }

    // Create action record
    const actionRecord: Action = {
      actionId: generateId('action'),
      playerId: player.playerId,
      seatNumber: player.seatNumber,
      actionType: action,
      amount: actionAmount,
      timestamp: Date.now(),
    };

    // Add action to betting round
    bettingRound.addAction(actionRecord);

    return actionRecord;
  }
}

