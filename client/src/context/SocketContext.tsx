/**
 * Socket.io instance context
 * Phase 1: Socket connection management
 */

import { createContext, useContext } from 'react';
import { Socket } from 'socket.io-client';

export const SocketContext = createContext<Socket | null>(null);

export function useSocketContext(): Socket | null {
  const socket = useContext(SocketContext);
  return socket;
}

