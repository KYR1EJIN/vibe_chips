/**
 * Betting controls component
 * Phase 2: Action buttons and bet amount input
 */

import { useState } from 'react';
import { Hand, Player, ActionType } from '@vibe-chips/shared';

interface BettingControlsProps {
  player: Player;
  hand: Hand;
  bigBlind: number;
  onAction: (action: ActionType, amount?: number) => void;
}

export function BettingControls({
  player,
  hand,
  bigBlind,
  onAction,
}: BettingControlsProps) {
  const [betAmount, setBetAmount] = useState<string>('');
  const [raiseAmount, setRaiseAmount] = useState<string>('');

  if (!hand.currentBettingRound) {
    return null;
  }

  const bettingRound = hand.currentBettingRound;
  const isPlayerTurn = bettingRound.actionSeat === player.seatNumber;
  const amountToCall = bettingRound.highestBet - player.currentBet;
  const canCheck = amountToCall === 0;
  const canCall = amountToCall > 0 && player.stack >= amountToCall;
  const canBet = amountToCall === 0 && player.stack >= bigBlind;
  const canRaise = amountToCall > 0 && player.stack > amountToCall;
  const minimumRaise = bettingRound.minimumRaise;
  const minimumBet = bigBlind;

  const handleBet = () => {
    const amount = parseInt(betAmount, 10);
    if (amount >= minimumBet && amount <= player.stack) {
      onAction('bet', amount);
      setBetAmount('');
    }
  };

  const handleRaise = () => {
    const totalAmount = parseInt(raiseAmount, 10);
    // Total amount must be at least currentBet + amountToCall + minimumRaise
    const minimumTotal = player.currentBet + amountToCall + minimumRaise;
    if (
      totalAmount >= minimumTotal &&
      totalAmount <= player.stack + player.currentBet
    ) {
      onAction('raise', totalAmount);
      setRaiseAmount('');
    }
  };

  const handleCall = () => {
    onAction('call');
  };

  const handleCheck = () => {
    onAction('check');
  };

  const handleFold = () => {
    onAction('fold');
  };

  const handleAllIn = () => {
    onAction('all-in');
  };

  if (!isPlayerTurn) {
    return (
      <div className="bg-gray-800 text-white p-4 rounded-lg">
        <p className="text-center text-sm">
          Waiting for your turn...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-300">Your Turn</p>
        <p className="text-lg font-semibold">
          {amountToCall > 0
            ? `Amount to Call: ${amountToCall}`
            : 'No bet to call'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Check/Call */}
        {canCheck ? (
          <button
            onClick={handleCheck}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
          >
            Check
          </button>
        ) : canCall ? (
          <button
            onClick={handleCall}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
          >
            Call {amountToCall}
          </button>
        ) : null}

        {/* Fold */}
        <button
          onClick={handleFold}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold"
        >
          Fold
        </button>

        {/* All-In */}
        {player.stack > 0 && (
          <button
            onClick={handleAllIn}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-semibold"
          >
            All-In ({player.stack})
          </button>
        )}
      </div>

      {/* Bet Input */}
      {canBet && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              min={minimumBet}
              max={player.stack}
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder={`Min: ${minimumBet}`}
              className="flex-1 px-3 py-2 rounded text-gray-900"
            />
            <button
              onClick={handleBet}
              disabled={
                !betAmount ||
                parseInt(betAmount, 10) < minimumBet ||
                parseInt(betAmount, 10) > player.stack
              }
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded font-semibold"
            >
              Bet
            </button>
          </div>
        </div>
      )}

      {/* Raise Input */}
      {canRaise && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              min={player.currentBet + amountToCall + minimumRaise}
              max={player.stack + player.currentBet}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(e.target.value)}
              placeholder={`Min total: ${player.currentBet + amountToCall + minimumRaise}`}
              className="flex-1 px-3 py-2 rounded text-gray-900"
            />
            <button
              onClick={handleRaise}
              disabled={
                !raiseAmount ||
                parseInt(raiseAmount, 10) < player.currentBet + amountToCall + minimumRaise ||
                parseInt(raiseAmount, 10) > player.stack + player.currentBet
              }
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded font-semibold"
            >
              Raise
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

