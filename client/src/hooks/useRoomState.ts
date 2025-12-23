/**
 * Room state subscription hook
 * Phase 1: Subscribe to room_state events
 */

import { useState, useEffect } from 'react';
import { RoomState } from '@vibe-chips/shared';
import { useSocket } from './useSocket';

export function useRoomState(): RoomState | null {
  const socket = useSocket();
  const [roomState, setRoomState] = useState<RoomState | null>(null);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleRoomState = (payload: { room: RoomState }) => {
      setRoomState(payload.room);
    };

    // socket is guaranteed to be non-null here due to early return above
    const currentSocket = socket;
    currentSocket.on('room_state', handleRoomState);

    return () => {
      currentSocket.off('room_state', handleRoomState);
    };
  }, [socket]);

  return roomState;
}
