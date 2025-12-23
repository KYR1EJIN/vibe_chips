/**
 * Socket event validation schemas
 * Phase 1: Room creation, joining, and seating validation
 */

import { z } from 'zod';
import { MAX_SEATS, MIN_STARTING_STACK } from '../constants/tableConstants';

// Client → Server Event Schemas
export const createRoomSchema = z.object({
  // No payload needed
});

export const joinRoomSchema = z.object({
  roomId: z.string()
    .min(1, 'Room ID is required')
    .regex(/^\d{6}$/, 'Room ID must be a 6-digit number'),
  playerId: z.string().optional(),
});

export const takeSeatSchema = z.object({
  seatNumber: z
    .number()
    .int('Seat number must be an integer')
    .min(1, 'Seat number must be at least 1')
    .max(MAX_SEATS, `Seat number must be at most ${MAX_SEATS}`),
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username must be 50 characters or less')
    .trim(),
  startingStack: z
    .number()
    .int('Starting stack must be an integer')
    .min(MIN_STARTING_STACK, `Starting stack must be at least ${MIN_STARTING_STACK}`),
});

export const leaveSeatSchema = z.object({
  // No payload needed
});

export const ownerUpdateConfigSchema = z.object({
  smallBlind: z.number().int().positive().optional(),
  bigBlind: z.number().int().positive().optional(),
  maxSeats: z
    .number()
    .int()
    .min(2, 'Max seats must be at least 2')
    .max(MAX_SEATS, `Max seats must be at most ${MAX_SEATS}`)
    .optional(),
});

export const ownerStartHandSchema = z.object({
  // No payload needed
});

export const playerActionSchema = z.object({
  action: z.enum(['bet', 'call', 'raise', 'check', 'fold', 'all-in']),
  amount: z.number().int().nonnegative().optional(),
});

export const requestSeatChangeSchema = z.object({
  newSeatNumber: z
    .number()
    .int('Seat number must be an integer')
    .min(1, 'Seat number must be at least 1')
    .max(MAX_SEATS, `Seat number must be at most ${MAX_SEATS}`),
});

export const ownerApproveSeatChangeSchema = z.object({
  playerId: z.string().min(1, 'Player ID is required'),
  newSeatNumber: z
    .number()
    .int('Seat number must be an integer')
    .min(1, 'Seat number must be at least 1')
    .max(MAX_SEATS, `Seat number must be at most ${MAX_SEATS}`),
});

export const socketSchemas = {
  create_room: createRoomSchema,
  join_room: joinRoomSchema,
  take_seat: takeSeatSchema,
  leave_seat: leaveSeatSchema,
  request_seat_change: requestSeatChangeSchema,
  owner_approve_seat_change: ownerApproveSeatChangeSchema,
  owner_update_config: ownerUpdateConfigSchema,
  owner_start_hand: ownerStartHandSchema,
  player_action: playerActionSchema,
};

