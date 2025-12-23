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

  // TypeScript type narrowing: socket is non-null after the check
  const socketId = socket.id;
  return room.ownerId === socketId;
}
