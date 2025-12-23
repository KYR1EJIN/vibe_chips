/**
 * Room validation schemas
 * Phase 1: Room configuration validation
 */

import { z } from 'zod';
import { MAX_SEATS, MIN_SEATS } from '../constants/tableConstants';

export const roomConfigSchema = z
  .object({
    smallBlind: z.number().int().positive('Small blind must be positive'),
    bigBlind: z.number().int().positive('Big blind must be positive'),
    maxSeats: z
      .number()
      .int()
      .min(MIN_SEATS, `Max seats must be at least ${MIN_SEATS}`)
      .max(MAX_SEATS, `Max seats must be at most ${MAX_SEATS}`),
  })
  .refine((data) => data.bigBlind === data.smallBlind * 2, {
    message: 'Big blind must be exactly 2x small blind',
    path: ['bigBlind'],
  });

export const roomSchemas = {
  config: roomConfigSchema,
};

