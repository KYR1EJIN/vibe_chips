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

  if (!room || !socket) {
    return null;
  }

  // Convert players Map/Record to array and find player by socketId
  const players = room.players instanceof Map
    ? Array.from(room.players.values())
    : Object.values(room.players);

  // socket is guaranteed to be non-null after the check above
  return players.find((p) => p.socketId === socket!.id) || null;
}
