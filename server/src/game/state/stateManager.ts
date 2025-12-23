/**
 * Central state storage
 * Phase 1: In-memory room storage
 */

import { RoomState } from './roomState';
import { RoomId } from '@vibe-chips/shared';

/**
 * Connection tracking
 * Maps socketId -> { roomId, playerId }
 */
export interface ConnectionInfo {
  roomId: RoomId;
  playerId?: string;
}

/**
 * StateManager
 * Manages all room state in memory
 * Phase 1: Basic room storage
 */
class StateManager {
  private rooms: Map<RoomId, RoomState>;
  private connections: Map<string, ConnectionInfo>; // socketId -> ConnectionInfo

  constructor() {
    this.rooms = new Map();
    this.connections = new Map();
  }

  /**
   * Create a new room
   */
  public createRoom(roomId: RoomId, ownerId: string): RoomState {
    const room = new RoomState(roomId, ownerId);
    this.rooms.set(roomId, room);
    return room;
  }

  /**
   * Get room by ID
   */
  public getRoom(roomId: RoomId): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Delete room
   */
  public deleteRoom(roomId: RoomId): boolean {
    return this.rooms.delete(roomId);
  }

  /**
   * Check if room exists
   */
  public hasRoom(roomId: RoomId): boolean {
    return this.rooms.has(roomId);
  }

  /**
   * Track connection
   */
  public trackConnection(socketId: string, connectionInfo: ConnectionInfo): void {
    this.connections.set(socketId, connectionInfo);
  }

  /**
   * Get connection info
   */
  public getConnection(socketId: string): ConnectionInfo | undefined {
    return this.connections.get(socketId);
  }

  /**
   * Remove connection tracking
   */
  public removeConnection(socketId: string): void {
    this.connections.delete(socketId);
  }

  /**
   * Get all socket IDs in a room
   */
  public getRoomSocketIds(roomId: RoomId): string[] {
    const socketIds: string[] = [];
    for (const [socketId, conn] of this.connections.entries()) {
      if (conn.roomId === roomId) {
        socketIds.push(socketId);
      }
    }
    return socketIds;
  }
}

// Singleton instance
export const stateManager = new StateManager();


