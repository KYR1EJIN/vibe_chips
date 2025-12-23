/**
 * Betting info display component
 * Phase 2: Player stack, current bet, amount to call, status
 */

import { Player, Hand } from '@vibe-chips/shared';

interface BettingInfoProps {
  player: Player;
  hand: Hand | null;
}

export function BettingInfo({ player, hand }: BettingInfoProps) {
  const amountToCall =
    hand?.currentBettingRound && hand.currentBettingRound.highestBet
      ? hand.currentBettingRound.highestBet - player.currentBet
      : 0;

  const statusLabels: Record<string, string> = {
    active: 'Active',
    folded: 'Folded',
    'all-in': 'All-In',
    'sitting-out': 'Sitting Out',
    disconnected: 'Disconnected',
  };

  const statusLabel = statusLabels[player.status] || player.status;

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-300">Stack:</span>
        <span className="font-semibold">{player.stack}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-300">Current Bet:</span>
        <span className="font-semibold">{player.currentBet}</span>
      </div>
      {hand && hand.currentBettingRound && (
        <div className="flex justify-between">
          <span className="text-sm text-gray-300">Amount to Call:</span>
          <span className="font-semibold">{amountToCall}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-sm text-gray-300">Status:</span>
        <span
          className={`font-semibold ${
            player.status === 'active'
              ? 'text-green-400'
              : player.status === 'folded'
              ? 'text-red-400'
              : player.status === 'all-in'
              ? 'text-purple-400'
              : 'text-gray-400'
          }`}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

