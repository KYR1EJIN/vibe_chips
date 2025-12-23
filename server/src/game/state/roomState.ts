/**
 * Room state class/model
 * Phase 1: Room creation, joining, and seating
 */

import {
  RoomState as IRoomState,
  RoomId,
  RoomConfig,
  Seat,
  Player,
  MAX_SEATS,
  DEFAULT_SMALL_BLIND,
  DEFAULT_BIG_BLIND,
} from '@vibe-chips/shared';

/**
 * RoomState class
 * Manages room state and enforces invariants
 * Phase 1: Basic room state with seats and players
 */
export class RoomState implements IRoomState {
  public readonly roomId: RoomId;
  public ownerId: string; // Socket ID of room creator
  public readonly createdAt: number;
  public config: RoomConfig;
  public seats: Seat[];
  public players: Map<string, Player>;

  constructor(roomId: RoomId, ownerId: string) {
    this.roomId = roomId;
    this.ownerId = ownerId;
    this.createdAt = Date.now();
    this.config = {
      smallBlind: DEFAULT_SMALL_BLIND,
      bigBlind: DEFAULT_BIG_BLIND,
      maxSeats: MAX_SEATS,
    };
    this.players = new Map<string, Player>();
    this.seats = this._initializeSeats();
  }

  /**
   * Initialize empty seats array
   */
  private _initializeSeats(): Seat[] {
    const seats: Seat[] = [];
    for (let i = 1; i <= this.config.maxSeats; i++) {
      seats.push({
        seatNumber: i,
        isOccupied: false,
        playerId: null,
      });
    }
    return seats;
  }

  /**
   * Get seat by seat number
   */
  public getSeat(seatNumber: number): Seat | undefined {
    return this.seats.find((s) => s.seatNumber === seatNumber);
  }

  /**
   * Check if username is unique in room
   */
  public isUsernameUnique(username: string): boolean {
    for (const player of this.players.values()) {
      if (player.username.toLowerCase() === username.toLowerCase()) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get player by ID
   */
  public getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  /**
   * Get player by socket ID
   */
  public getPlayerBySocketId(socketId: string): Player | undefined {
    for (const player of this.players.values()) {
      if (player.socketId === socketId) {
        return player;
      }
    }
    return undefined;
  }

  /**
   * Add player to room
   * Phase 1: Basic player addition
   */
  public addPlayer(player: Player): void {
    this.players.set(player.playerId, player);
    const seat = this.getSeat(player.seatNumber);
    if (seat) {
      seat.isOccupied = true;
      seat.playerId = player.playerId;
    }
  }

  /**
   * Remove player from room
   * Phase 1: Basic player removal
   */
  public removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (player) {
      const seat = this.getSeat(player.seatNumber);
      if (seat) {
        seat.isOccupied = false;
        seat.playerId = null;
      }
      this.players.delete(playerId);
    }
  }

  /**
   * Update room configuration
   * Phase 1: Only blinds, no gameplay effect yet
   */
  public updateConfig(updates: Partial<RoomConfig>): void {
    if (updates.smallBlind !== undefined) {
      this.config.smallBlind = updates.smallBlind;
      // Enforce bigBlind = 2x smallBlind
      this.config.bigBlind = updates.smallBlind * 2;
    }
    if (updates.bigBlind !== undefined) {
      this.config.bigBlind = updates.bigBlind;
      // Enforce smallBlind = bigBlind / 2
      this.config.smallBlind = updates.bigBlind / 2;
    }
    if (updates.maxSeats !== undefined) {
      // Phase 1: Max seats change not fully supported yet
      // Would need to adjust seats array
      this.config.maxSeats = updates.maxSeats;
    }
  }

  /**
   * Convert to plain object for serialization
   */
  public toJSON(): IRoomState {
    return {
      roomId: this.roomId,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      config: { ...this.config },
      seats: [...this.seats],
      players: Object.fromEntries(this.players),
    };
  }
}

