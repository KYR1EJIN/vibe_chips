/**
 * Room Page component
 * Phase 1: Poker table visualization with seats
 */

import { useState, useEffect, useContext } from 'react';
import { useSocket } from '../hooks/useSocket';
import { RoomContext } from '../context/RoomContext';
import { useOwner } from '../hooks/useOwner';
import { usePlayer } from '../hooks/usePlayer';
import { SeatComponent } from '../components/table/Seat';
import { SeatModal } from '../components/modals/SeatModal';
import { RoomLink } from '../components/room/RoomLink';
import { RoomConfig } from '../components/room/RoomConfig';
import { HandStatus } from '../components/betting/HandStatus';
import { BettingControls } from '../components/betting/BettingControls';
import { BettingInfo } from '../components/betting/BettingInfo';
import { Player, ActionType } from '@vibe-chips/shared';

interface RoomPageProps {
  roomId: string | null;
  onBack: () => void;
}

function RoomPage({ roomId, onBack }: RoomPageProps) {
  const socket = useSocket();
  const room = useContext(RoomContext);
  const isOwner = useOwner();
  const currentPlayer = usePlayer();
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  
  // If we have a roomId but no room state yet, request it
  useEffect(() => {
    if (socket && roomId && !room) {
      console.log('RoomPage: No room state, requesting for roomId:', roomId);
      socket.emit('join_room', { roomId });
    } else if (room) {
      console.log('RoomPage: Room state available:', room.roomId);
    }
  }, [socket, roomId, room]);

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  const handleSeatClick = (seatNumber: number) => {
    const seat = room.seats.find((s) => s.seatNumber === seatNumber);
    if (seat && !seat.isOccupied) {
      setSelectedSeat(seatNumber);
    }
  };

  const handleTakeSeat = (username: string, startingStack: number) => {
    if (!socket || !selectedSeat) return;
    socket.emit('take_seat', {
      seatNumber: selectedSeat,
      username,
      startingStack,
    });
    setSelectedSeat(null);
  };

  const handleLeaveSeat = () => {
    if (!socket || !currentPlayer) return;
    socket.emit('leave_seat', {});
  };

  const handleStartHand = () => {
    if (!socket) return;
    socket.emit('owner_start_hand', {});
  };

  const handlePlayerAction = (action: ActionType, amount?: number) => {
    if (!socket) return;
    socket.emit('player_action', { action, amount });
  };

  // Get player for each seat
  const getPlayerForSeat = (seatNumber: number): Player | null => {
    if (!room.players) return null;
    const players = room.players instanceof Map
      ? Array.from(room.players.values())
      : Object.values(room.players);
    return players.find((p) => p.seatNumber === seatNumber) || null;
  };

  // Poker table layout: 10 seats arranged in a circle
  // Positions: Top (3, 4), Right (5, 6), Bottom (7, 8, 9, 10), Left (1, 2)
  const seatPositions = [
    { seat: 1, top: '10%', left: '5%' }, // Top-left
    { seat: 2, top: '10%', left: '15%' }, // Top-left
    { seat: 3, top: '5%', left: '45%' }, // Top-center
    { seat: 4, top: '5%', left: '55%' }, // Top-center
    { seat: 5, top: '25%', left: '85%' }, // Right
    { seat: 6, top: '35%', left: '85%' }, // Right
    { seat: 7, top: '75%', left: '55%' }, // Bottom-right
    { seat: 8, top: '75%', left: '45%' }, // Bottom-center
    { seat: 9, top: '75%', left: '15%' }, // Bottom-left
    { seat: 10, top: '75%', left: '5%' }, // Bottom-left
  ];

  return (
    <div className="min-h-screen bg-green-900 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 space-y-4">
        <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Room: <span className="font-mono tracking-widest">{room.roomId}</span>
            </h1>
            <p className="text-sm text-gray-600">
              Blinds: {room.config.smallBlind} / {room.config.bigBlind}
            </p>
          </div>
          <div className="flex gap-3">
            {isOwner && (
              <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold">
                Owner
              </span>
            )}
            {currentPlayer && (
              <button
                onClick={handleLeaveSeat}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Leave Seat
              </button>
            )}
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Owner Controls */}
        {isOwner && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RoomLink roomId={room.roomId} />
            <RoomConfig />
            {!room.currentHand && (
              <div className="md:col-span-2">
                <button
                  onClick={handleStartHand}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
                >
                  Start Hand
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hand Status */}
        {room.currentHand && (
          <HandStatus hand={room.currentHand} />
        )}

        {/* Betting Controls & Info for Current Player */}
        {currentPlayer && room.currentHand && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BettingInfo player={currentPlayer} hand={room.currentHand} />
            <BettingControls
              player={currentPlayer}
              hand={room.currentHand}
              bigBlind={room.config.bigBlind}
              onAction={handlePlayerAction}
            />
          </div>
        )}
      </div>

      {/* Poker Table */}
      <div className="max-w-6xl mx-auto">
        <div className="relative bg-green-800 rounded-full aspect-square border-8 border-amber-800 shadow-2xl">
          {/* Table felt */}
          <div className="absolute inset-8 bg-green-700 rounded-full"></div>

          {/* Seats */}
          {seatPositions.map(({ seat, top, left }) => {
            const seatData = room.seats.find((s) => s.seatNumber === seat);
            const player = seatData ? getPlayerForSeat(seat) : null;
            if (!seatData) return null;

            return (
              <div
                key={seat}
                className="absolute"
                style={{ top, left, transform: 'translate(-50%, -50%)' }}
              >
                <SeatComponent
                  seat={seatData}
                  player={player}
                  hand={room.currentHand}
                  isOwner={player?.socketId === room.ownerId}
                  isCurrentPlayer={player?.socketId === currentPlayer?.socketId}
                  onClick={() => handleSeatClick(seat)}
                />
              </div>
            );
          })}

          {/* Center area (for future: pot display, community cards) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            {room.currentHand ? (
              <div className="text-white">
                <div className="text-lg font-semibold">
                  {room.currentHand.phase.toUpperCase()}
                </div>
                {room.currentHand.currentBettingRound && (
                  <div className="text-sm opacity-75">
                    Highest Bet: {room.currentHand.currentBettingRound.highestBet}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-white text-sm opacity-50">
                Waiting for players...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seat Modal */}
      <SeatModal
        seatNumber={selectedSeat || 0}
        isOpen={selectedSeat !== null}
        onClose={() => setSelectedSeat(null)}
        onSubmit={handleTakeSeat}
      />
    </div>
  );
}

export default RoomPage;


