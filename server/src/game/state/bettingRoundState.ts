/**
 * BettingRound state class/model
 * Phase 2: Preflop betting round only
 */

import {
  BettingRound,
  RoundType,
  Action,
} from '@vibe-chips/shared';
import { generateId } from '../../utils/idGenerator';

/**
 * BettingRoundState class
 * Manages betting round state and enforces invariants
 * Phase 2: Preflop betting round only
 */
export class BettingRoundState implements BettingRound {
  public readonly roundId: string;
  public readonly roundType: RoundType;
  public actionSeat: number | null; // Seat number that should act next (null if complete)
  public highestBet: number; // Highest bet amount in this round
  public minimumRaise: number; // Minimum raise amount (size of last raise)
  public actions: Action[]; // Actions taken in this round (chronological)
  public isComplete: boolean; // Whether betting round is finished
  public readonly startedAt: number;
  public completedAt: number | null; // Timestamp when round completed

  constructor(roundType: RoundType, actionSeat: number | null, bigBlind: number) {
    this.roundId = generateId('round');
    this.roundType = roundType;
    this.actionSeat = actionSeat;
    this.highestBet = bigBlind; // Phase 2: Preflop starts with big blind
    this.minimumRaise = bigBlind; // Phase 2: Minimum raise is big blind initially
    this.actions = [];
    this.isComplete = false;
    this.startedAt = Date.now();
    this.completedAt = null;
  }

  /**
   * Add an action to the betting round
   * Phase 2: Records action and updates state
   */
  public addAction(action: Action): void {
    this.actions.push(action);
  }

  /**
   * Update highest bet (for bet/raise actions)
   * Phase 2: Updates highestBet and minimumRaise
   */
  public updateHighestBet(newBet: number, previousBet: number): void {
    const raiseAmount = newBet - previousBet;
    if (raiseAmount > 0) {
      // This is a raise, update minimumRaise
      this.minimumRaise = raiseAmount;
    }
    this.highestBet = Math.max(this.highestBet, newBet);
  }

  /**
   * Mark betting round as complete
   * Phase 2: Sets isComplete and completedAt
   */
  public markComplete(): void {
    this.isComplete = true;
    this.actionSeat = null;
    this.completedAt = Date.now();
  }

  /**
   * Convert to plain object for serialization
   */
  public toJSON(): BettingRound {
    return {
      roundId: this.roundId,
      roundType: this.roundType,
      actionSeat: this.actionSeat,
      highestBet: this.highestBet,
      minimumRaise: this.minimumRaise,
      actions: [...this.actions],
      isComplete: this.isComplete,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
    };
  }
}

