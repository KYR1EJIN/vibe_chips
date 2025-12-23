/**
 * Current room state context
 * Phase 1: Room state management
 */

import { createContext, useContext } from 'react';
import { RoomState } from '@vibe-chips/shared';

export const RoomContext = createContext<RoomState | null>(null);

export function useRoomContext(): RoomState {
  const room = useContext(RoomContext);
  if (!room) {
    throw new Error('useRoomContext must be used within RoomProvider');
  }
  return room;
}

