/**
 * Socket.io connection hook
 * Phase 1: Socket connection management
 */

import { useSocketContext } from '../context/SocketContext';

export function useSocket() {
  return useSocketContext();
}

