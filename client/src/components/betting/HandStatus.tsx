/**
 * Hand status component
 * Phase 2: Display hand active indicator and current phase
 */

import { Hand } from '@vibe-chips/shared';

interface HandStatusProps {
  hand: Hand | null;
}

export function HandStatus({ hand }: HandStatusProps) {
  if (!hand) {
    return (
      <div className="bg-gray-800 text-white p-4 rounded-lg text-center">
        <p className="text-sm text-gray-300">No active hand</p>
      </div>
    );
  }

  const phaseLabels: Record<string, string> = {
    'pre-hand': 'Pre-Hand Setup',
    preflop: 'Preflop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
    showdown: 'Showdown',
    completed: 'Completed',
  };

  const phaseLabel = phaseLabels[hand.phase] || hand.phase;

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-300">Hand Active</p>
          <p className="text-lg font-semibold">{phaseLabel}</p>
        </div>
        {hand.currentBettingRound && (
          <div className="text-right">
            <p className="text-xs text-gray-300">Highest Bet</p>
            <p className="text-sm font-semibold">
              {hand.currentBettingRound.highestBet}
            </p>
          </div>
        )}
      </div>
      {hand.currentBettingRound && hand.currentBettingRound.actionSeat && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-300">
            Action on Seat {hand.currentBettingRound.actionSeat}
          </p>
        </div>
      )}
    </div>
  );
}

