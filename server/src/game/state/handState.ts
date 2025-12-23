/**
 * Hand state class/model
 * Phase 2: Preflop betting only
 */

import {
  Hand,
  HandId,
  HandPhase,
  BettingRound,
} from '@vibe-chips/shared';
import { generateId } from '../../utils/idGenerator';
import { BettingRoundState } from './bettingRoundState';

/**
 * HandState class
 * Manages hand state and enforces invariants
 * Phase 2: Preflop betting only
 */
export class HandState implements Hand {
  public readonly handId: HandId;
  public phase: HandPhase;
  public dealerButtonSeat: number; // Seat number with dealer button
  public smallBlindSeat: number; // Seat number posting small blind
  public bigBlindSeat: number; // Seat number posting big blind
  public currentBettingRound: BettingRoundState | null; // Active betting round
  public bettingRounds: BettingRound[]; // History of completed betting rounds
  public readonly startedAt: number;
  public endedAt: number | null; // Timestamp when hand ended (null if active)

  constructor(
    dealerButtonSeat: number,
    smallBlindSeat: number,
    bigBlindSeat: number,
    firstActionSeat: number,
    bigBlind: number
  ) {
    this.handId = generateId('hand');
    this.phase = 'preflop'; // Phase 2: Start directly in preflop
    this.dealerButtonSeat = dealerButtonSeat;
    this.smallBlindSeat = smallBlindSeat;
    this.bigBlindSeat = bigBlindSeat;
    this.bettingRounds = [];
    
    // Phase 2: Initialize preflop betting round
    this.currentBettingRound = new BettingRoundState('preflop', firstActionSeat, bigBlind);
    
    this.startedAt = Date.now();
    this.endedAt = null;
  }

  /**
   * Complete current betting round
   * Phase 2: Moves current round to history
   */
  public completeBettingRound(): void {
    if (this.currentBettingRound) {
      this.currentBettingRound.markComplete();
      this.bettingRounds.push(this.currentBettingRound.toJSON());
      this.currentBettingRound = null;
    }
  }

  /**
   * Convert to plain object for serialization
   */
  public toJSON(): Hand {
    return {
      handId: this.handId,
      phase: this.phase,
      dealerButtonSeat: this.dealerButtonSeat,
      smallBlindSeat: this.smallBlindSeat,
      bigBlindSeat: this.bigBlindSeat,
      currentBettingRound: this.currentBettingRound?.toJSON() || null,
      bettingRounds: [...this.bettingRounds],
      startedAt: this.startedAt,
      endedAt: this.endedAt,
    };
  }
}
