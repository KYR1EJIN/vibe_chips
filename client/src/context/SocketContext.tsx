/**
 * Socket.io instance context
 * Phase 1: Socket connection management
 */

import { createContext, useContext } from 'react';
import { Socket } from 'socket.io-client';

export const SocketContext = createContext<Socket | null>(null);

export function useSocketContext(): Socket {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return socket;
}

