/**
 * Current player hook
 * Phase 1: Get current player from room state
 */

import { useSocket } from './useSocket';
import { useRoomState } from './useRoomState';
import { Player } from '@vibe-chips/shared';

export function usePlayer(): Player | null {
  const socket = useSocket();
  const room = useRoomState();

  if (!room) {
    return null;
  }

  // Convert players Map/Record to array and find player by socketId
  const players = room.players instanceof Map
    ? Array.from(room.players.values())
    : Object.values(room.players);

  return players.find((p) => p.socketId === socket.id) || null;
}
