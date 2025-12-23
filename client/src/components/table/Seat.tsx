/**
 * Seat component
 * Phase 1: Display seat state and handle seat clicks
 */

import { Seat as SeatType, Player } from '@vibe-chips/shared';

interface SeatProps {
  seat: SeatType;
  player: Player | null;
  isOwner: boolean;
  isCurrentPlayer: boolean;
  onClick: () => void;
}

export function SeatComponent({
  seat,
  player,
  isOwner,
  isCurrentPlayer,
  onClick,
}: SeatProps) {
  const isEmpty = !seat.isOccupied;
  const isClickable = isEmpty && !player;

  return (
    <div
      className={`relative w-24 h-24 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
        isEmpty
          ? 'bg-gray-200 border-gray-400 hover:bg-gray-300'
          : 'bg-green-100 border-green-500'
      } ${isClickable ? 'hover:scale-105' : ''}`}
      onClick={isClickable ? onClick : undefined}
    >
      {isEmpty ? (
        <span className="text-gray-600 font-semibold text-sm">SIT</span>
      ) : player ? (
        <div className="text-center">
          <div className="text-xs font-semibold text-gray-800 truncate max-w-[80px]">
            {player.username}
          </div>
          <div className="text-xs text-gray-600">{player.stack}</div>
          {isOwner && (
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-1 rounded">
              Owner
            </div>
          )}
          {isCurrentPlayer && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-1 rounded">
              You
            </div>
          )}
        </div>
      ) : null}
      <div className="absolute -top-1 -left-1 bg-gray-700 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
        {seat.seatNumber}
      </div>
    </div>
  );
}

