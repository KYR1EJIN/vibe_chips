/**
 * Owner permissions hook
 * Phase 1: Check if current user is room owner
 */

import { useSocket } from './useSocket';
import { useRoomState } from './useRoomState';

export function useOwner(): boolean {
  const socket = useSocket();
  const room = useRoomState();

  if (!room || !socket) {
    return false;
  }

  // socket is guaranteed to be non-null after the check above
  return room.ownerId === socket!.id;
}
