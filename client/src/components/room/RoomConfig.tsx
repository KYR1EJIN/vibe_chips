/**
 * Room Config component
 * Phase 1: Owner can update blinds
 */

import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useRoomState } from '../../hooks/useRoomState';

export function RoomConfig() {
  const socket = useSocket();
  const room = useRoomState();
  const [smallBlind, setSmallBlind] = useState(
    room?.config.smallBlind.toString() || '5'
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync with room state changes
  useEffect(() => {
    if (room) {
      setSmallBlind(room.config.smallBlind.toString());
    }
  }, [room]);

  if (!room) return null;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || isUpdating) return;

    const sb = parseInt(smallBlind, 10);
    if (sb > 0) {
      setIsUpdating(true);
      socket.emit('owner_update_config', {
        smallBlind: sb,
      });
      // Reset updating state after a delay
      setTimeout(() => setIsUpdating(false), 1000);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Room Configuration</h3>
      <form onSubmit={handleUpdate} className="space-y-3">
        <div>
          <label
            htmlFor="smallBlind"
            className="block text-xs font-medium text-gray-600 mb-1"
          >
            Small Blind
          </label>
          <input
            id="smallBlind"
            type="number"
            value={smallBlind}
            onChange={(e) => setSmallBlind(e.target.value)}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <p className="text-xs text-gray-500">
            Big Blind: {parseInt(smallBlind, 10) * 2 || room.config.bigBlind}
          </p>
        </div>
        <button
          type="submit"
          disabled={isUpdating}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
        >
          {isUpdating ? 'Updating...' : 'Update Blinds'}
        </button>
      </form>
    </div>
  );
}

