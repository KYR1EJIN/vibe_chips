/**
 * Player state class/model
 * Phase 1: Basic player state for seating
 */

import { Player, PlayerId, PlayerStatus } from '@vibe-chips/shared';

/**
 * PlayerState class
 * Manages player state and enforces invariants
 * Phase 1: Basic player state for seating
 */
export class PlayerState implements Player {
  public readonly playerId: PlayerId;
  public socketId: string;
  public readonly username: string;
  public seatNumber: number;
  public stack: number;
  public currentBet: number; // Phase 2: Bet amount in current betting round
  public status: PlayerStatus;
  public isConnected: boolean;
  public readonly joinedAt: number;

  constructor(
    playerId: PlayerId,
    socketId: string,
    username: string,
    seatNumber: number,
    startingStack: number
  ) {
    this.playerId = playerId;
    this.socketId = socketId;
    this.username = username;
    this.seatNumber = seatNumber;
    this.stack = startingStack;
    this.currentBet = 0; // Phase 2: Initialize currentBet to 0
    this.status = 'sitting-out'; // Phase 1: Players start as sitting-out
    this.isConnected = true;
    this.joinedAt = Date.now();
  }

  /**
   * Update socket connection
   */
  public updateSocketId(socketId: string): void {
    this.socketId = socketId;
    this.isConnected = true;
  }

  /**
   * Mark as disconnected
   */
  public markDisconnected(): void {
    this.isConnected = false;
    // Phase 1: Don't change status on disconnect
    // Phase 5+: May preserve status if chips in play
  }

  /**
   * Mark as reconnected
   */
  public markReconnected(socketId: string): void {
    this.socketId = socketId;
    this.isConnected = true;
  }

  /**
   * Reset currentBet for new betting round
   * Phase 2: Reset bet at start of each betting round
   */
  public resetCurrentBet(): void {
    this.currentBet = 0;
  }

  /**
   * Convert to plain object for serialization
   */
  public toJSON(): Player {
    return {
      playerId: this.playerId,
      socketId: this.socketId,
      username: this.username,
      seatNumber: this.seatNumber,
      stack: this.stack,
      currentBet: this.currentBet,
      status: this.status,
      isConnected: this.isConnected,
      joinedAt: this.joinedAt,
    };
  }
}

