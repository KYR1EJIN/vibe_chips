/**
 * ID generation utilities
 * Phase 1: Room ID generation
 */

/**
 * Generate a short, URL-friendly room ID
 * Format: 6-digit number (000000-999999)
 */
export function generateRoomId(): string {
  // Generate a random 6-digit number (000000-999999)
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  const roomId = Math.floor(Math.random() * (max - min + 1)) + min;
  return roomId.toString();
}

/**
 * Generate a unique player ID
 */
export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique ID with prefix
 * Phase 2: For hands, betting rounds, actions, etc.
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

