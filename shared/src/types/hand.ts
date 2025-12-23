/**
 * Hand types
 * Phase 2: Preflop betting only
 */

export type HandId = string;

export type HandPhase = 'pre-hand' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'completed';

export type RoundType = 'preflop' | 'flop' | 'turn' | 'river';

/**
 * Action taken in a betting round
 * Phase 2: Basic action tracking
 */
export interface Action {
  actionId: string; // Unique identifier for this action
  playerId: string; // Player who took the action
  seatNumber: number; // Seat number of the player
  actionType: 'bet' | 'call' | 'raise' | 'check' | 'fold' | 'all-in';
  amount: number; // Amount of the action (0 for check/fold)
  timestamp: number; // When action was taken
}

/**
 * BettingRound interface
 * Phase 2: Preflop betting round only
 */
export interface BettingRound {
  roundId: string; // Unique identifier for this round
  roundType: RoundType; // preflop | flop | turn | river
  actionSeat: number | null; // Seat number that should act next (null if complete)
  highestBet: number; // Highest bet amount in this round
  minimumRaise: number; // Minimum raise amount (size of last raise)
  actions: Action[]; // Actions taken in this round (chronological)
  isComplete: boolean; // Whether betting round is finished
  startedAt: number; // Timestamp when round started
  completedAt: number | null; // Timestamp when round completed
}

/**
 * Hand interface
 * Phase 2: Preflop betting only
 */
export interface Hand {
  handId: HandId;
  phase: HandPhase; // Current phase of the hand
  dealerButtonSeat: number; // Seat number with dealer button
  smallBlindSeat: number; // Seat number posting small blind
  bigBlindSeat: number; // Seat number posting big blind
  currentBettingRound: BettingRound | null; // Active betting round
  bettingRounds: BettingRound[]; // History of completed betting rounds
  startedAt: number; // Timestamp when hand started
  endedAt: number | null; // Timestamp when hand ended (null if active)
}

