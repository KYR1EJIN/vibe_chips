/**
 * Owner permissions hook
 * Phase 1: Check if current user is room owner
 */

import { useSocket } from './useSocket';
import { useRoomState } from './useRoomState';

export function useOwner(): boolean {
  const socket = useSocket();
  const room = useRoomState();

  if (!room) {
    return false;
  }

  return room.ownerId === socket.id;
}
