# Real-Time Event System

## Overview

This document defines the canonical Socket.io event protocol for ChipTable. All client-server communication follows these event contracts. This is the single source of truth for the real-time API.

---

## Event System Architecture

- **Transport**: Socket.io (WebSocket with fallbacks)
- **Direction**: Bidirectional (client → server requests, server → client broadcasts)
- **State Mutations**: All state changes occur server-side after validation
- **Broadcasting**: State changes broadcast to all room participants
- **Ordering**: Events processed sequentially per room (no concurrent mutations)

---

## Client → Server Events

### Room Management Events

#### `join_room`
**Description**: Client requests to join a room (new or reconnecting)

**Payload**:
```typescript
{
  roomId: string
  playerId?: string  // Optional: for reconnection
}
```

**Mutates State**: No (connection tracking only)

**Owner-Only**: No

**Response**: Server sends `room_state` event with full state snapshot

**Validation**:
- `roomId` must exist (or create new room if invalid)
- `playerId` must be valid if provided (for reconnection)

---

#### `create_room`
**Description**: Client requests to create a new room (becomes owner)

**Payload**:
```typescript
{
  // No payload needed, room ID generated server-side
}
```

**Mutates State**: Yes (creates new room, sets owner)

**Owner-Only**: N/A (creates ownership)

**Response**: Server sends `room_created` with `roomId`, then `room_state`

**Validation**:
- None (anyone can create a room)

---

### Seating Events

#### `take_seat`
**Description**: Player requests to take an empty seat

**Payload**:
```typescript
{
  seatNumber: number  // 1-10
  username: string    // Must be unique per room
  startingStack: number  // Must be > 0
}
```

**Mutates State**: Yes (occupies seat, creates player, initializes stack)

**Owner-Only**: No

**Validation**:
- Seat must be empty
- Username must be unique in room
- `startingStack` must be > 0
- Room must not be in active hand (or allow seating out)

**Response**: `action_ack` → `room_state` → `player_joined` (to all clients)

---

#### `leave_seat`
**Description**: Player requests to leave their seat

**Payload**:
```typescript
{
  // No payload needed, playerId from socket connection
}
```

**Mutates State**: Yes (frees seat, removes player if no chips in play)

**Owner-Only**: No (players can leave their own seat)

**Validation**:
- Player must be seated
- If player has chips in active hand, may need owner approval (TBD)

**Response**: `action_ack` → `room_state` → `player_left` (to all clients)

---

### Player Action Events

#### `player_action`
**Description**: Player performs a betting action (bet, call, raise, check, fold, all-in)

**Payload**:
```typescript
{
  action: "bet" | "call" | "raise" | "check" | "fold" | "all-in"
  amount?: number  // Required for bet/raise, optional for all-in
}
```

**Mutates State**: Yes (updates player bet, stack, status, betting round state)

**Owner-Only**: No

**Validation**:
- Must be player's turn (`actionSeat === player.seatNumber`)
- Hand must be in active betting round
- Player must have `status === "active"`
- Amount must be valid (≥ minimum bet/raise, ≤ stack)
- Action must be legal (e.g., can't check if there's a bet to call)

**Response**: `action_ack` → `room_state` (to all clients)

---

### Owner-Only Action Events

#### `owner_start_hand`
**Description**: Owner starts a new hand

**Payload**:
```typescript
{
  // No payload needed, uses current room state
}
```

**Mutates State**: Yes (creates new hand, posts blinds, starts preflop)

**Owner-Only**: Yes

**Validation**:
- Must be at least 2 players seated
- No active hand currently running
- Owner must be connected

**Response**: `action_ack` → `room_state` → `hand_started` (to all clients)

---

#### `owner_advance_round`
**Description**: Owner manually advances to next betting round (preflop → flop → turn → river)

**Payload**:
```typescript
{
  // No payload needed, advances to next phase
}
```

**Mutates State**: Yes (completes current betting round, advances hand phase)

**Owner-Only**: Yes

**Validation**:
- Hand must be active
- Current betting round must be complete
- Must not be in showdown phase

**Response**: `action_ack` → `room_state` → `round_advanced` (to all clients)

---

#### `owner_assign_button`
**Description**: Owner manually assigns/moves dealer button

**Payload**:
```typescript
{
  seatNumber: number  // Target seat for dealer button
}
```

**Mutates State**: Yes (updates dealer button position, recalculates blinds)

**Owner-Only**: Yes

**Validation**:
- Seat must be occupied
- Hand must be in pre-hand phase or lobby

**Response**: `action_ack` → `room_state` (to all clients)

---

#### `owner_force_fold`
**Description**: Owner forces a player to fold

**Payload**:
```typescript
{
  playerId: string  // Player to force fold
}
```

**Mutates State**: Yes (sets player status to folded, updates betting round)

**Owner-Only**: Yes

**Validation**:
- Player must be in active hand
- Player must have `status === "active"`

**Response**: `action_ack` → `room_state` (to all clients)

---

#### `owner_adjust_stack`
**Description**: Owner manually adjusts a player's chip stack

**Payload**:
```typescript
{
  playerId: string
  newStack: number  // New stack amount (must be ≥ 0)
}
```

**Mutates State**: Yes (updates player stack)

**Owner-Only**: Yes

**Validation**:
- Player must exist in room
- `newStack` must be ≥ 0
- Should not be allowed during active hand (or with confirmation)

**Response**: `action_ack` → `room_state` (to all clients)

---

#### `owner_undo`
**Description**: Owner undoes the last state-changing event

**Payload**:
```typescript
{
  eventId?: string  // Optional: specific event to undo, or last event if omitted
}
```

**Mutates State**: Yes (restores state from event's snapshot)

**Owner-Only**: Yes

**Validation**:
- Event must exist in event log
- Event must be undoable (some system events may not be)
- Must not break state invariants

**Response**: `action_ack` → `room_state` (to all clients)

---

#### `owner_end_hand`
**Description**: Owner ends current hand (skip to showdown or cancel)

**Payload**:
```typescript
{
  // No payload needed
}
```

**Mutates State**: Yes (moves hand to showdown or cancels hand)

**Owner-Only**: Yes

**Validation**:
- Hand must be active

**Response**: `action_ack` → `room_state` → `hand_ended` (to all clients)

---

#### `owner_reset_room`
**Description**: Owner resets room to lobby state (clears hand, resets all players)

**Payload**:
```typescript
{
  // No payload needed
}
```

**Mutates State**: Yes (clears current hand, resets all player states)

**Owner-Only**: Yes

**Validation**:
- Owner must be connected

**Response**: `action_ack` → `room_state` → `room_reset` (to all clients)

---

#### `owner_kick_player`
**Description**: Owner removes a player from the room

**Payload**:
```typescript
{
  playerId: string  // Player to kick
}
```

**Mutates State**: Yes (removes player, frees seat)

**Owner-Only**: Yes

**Validation**:
- Player must exist in room
- Cannot kick self (owner)

**Response**: `action_ack` → `room_state` → `player_left` (to all clients)

---

#### `owner_select_winners`
**Description**: Owner selects winners for pots during showdown

**Payload**:
```typescript
{
  potWinners: {
    potId: string
    winnerPlayerIds: string[]  // Can be multiple for split pots
    amounts?: number[]  // Optional: specific amounts per winner (for splits)
  }[]
}
```

**Mutates State**: Yes (distributes pots, updates player stacks, ends hand)

**Owner-Only**: Yes

**Validation**:
- Hand must be in showdown phase
- All pots must have winners assigned
- Winner IDs must be eligible for their respective pots
- Sum of distributed amounts must equal pot amounts

**Response**: `action_ack` → `room_state` → `pots_distributed` (to all clients)

---

#### `owner_update_config`
**Description**: Owner updates room configuration (blinds, max seats)

**Payload**:
```typescript
{
  smallBlind?: number
  bigBlind?: number
  maxSeats?: number
}
```

**Mutates State**: Yes (updates room config)

**Owner-Only**: Yes

**Validation**:
- Can only update when no active hand
- `bigBlind` must be 2x `smallBlind`
- `maxSeats` must be between 2 and 10

**Response**: `action_ack` → `room_state` (to all clients)

---

## Server → Client Events

### State Synchronization Events

#### `room_state`
**Description**: Full room state snapshot (sent on connect, after mutations, on reconnection)

**Payload**:
```typescript
{
  room: RoomState  // Complete room state (seats, players, hand, pots, etc.)
}
```

**Broadcast**: All clients in room

**When Sent**:
- On `join_room` (initial sync)
- After any state mutation
- On reconnection

---

#### `action_ack`
**Description**: Acknowledgment of client action request

**Payload**:
```typescript
{
  success: boolean
  eventId?: string  // If successful, the event ID created
  error?: {
    code: string
    message: string
  }
}
```

**Broadcast**: Only to requesting client

**When Sent**:
- Immediately after processing client action
- Before `room_state` broadcast (or included in it)

---

### Event Notifications

#### `player_joined`
**Description**: Notification that a player joined the room

**Payload**:
```typescript
{
  player: Player  // Player data
  seatNumber: number
}
```

**Broadcast**: All clients in room (except joining player, who gets `room_state`)

**When Sent**: After `take_seat` succeeds

---

#### `player_left`
**Description**: Notification that a player left the room

**Payload**:
```typescript
{
  playerId: string
  seatNumber: number
  reason: "voluntary" | "disconnected" | "kicked"
}
```

**Broadcast**: All clients in room

**When Sent**:
- After `leave_seat`
- On player disconnect (if no chips in play)
- After `owner_kick_player`

---

#### `hand_started`
**Description**: Notification that a new hand has started

**Payload**:
```typescript
{
  handId: string
  dealerButtonSeat: number
  smallBlindSeat: number
  bigBlindSeat: number
}
```

**Broadcast**: All clients in room

**When Sent**: After `owner_start_hand` succeeds

---

#### `hand_ended`
**Description**: Notification that current hand has ended

**Payload**:
```typescript
{
  handId: string
  reason: "showdown" | "all_folded" | "owner_cancelled"
}
```

**Broadcast**: All clients in room

**When Sent**: After hand completes (showdown or cancellation)

---

#### `round_advanced`
**Description**: Notification that betting round advanced

**Payload**:
```typescript
{
  newPhase: "flop" | "turn" | "river" | "showdown"
  previousPhase: "preflop" | "flop" | "turn" | "river"
}
```

**Broadcast**: All clients in room

**When Sent**: After `owner_advance_round` or automatic advancement

---

#### `pots_updated`
**Description**: Notification that pots have been updated (side pot created, etc.)

**Payload**:
```typescript
{
  pots: Pot[]  // Updated pot list
}
```

**Broadcast**: All clients in room

**When Sent**: When side pots are created (e.g., player goes all-in)

---

#### `pots_distributed`
**Description**: Notification that pots have been distributed to winners

**Payload**:
```typescript
{
  distributions: {
    potId: string
    winnerPlayerIds: string[]
    amounts: number[]
  }[]
}
```

**Broadcast**: All clients in room

**When Sent**: After `owner_select_winners` succeeds

---

### Error Events

#### `error`
**Description**: Error notification (validation failure, permission denied, etc.)

**Payload**:
```typescript
{
  code: string  // e.g., "NOT_YOUR_TURN", "INVALID_AMOUNT", "OWNER_ONLY"
  message: string
  eventType?: string  // The event that caused the error
}
```

**Broadcast**: Only to requesting client (or all if system error)

**When Sent**:
- On validation failure
- On permission denied (owner-only action)
- On invalid state (e.g., action when no active hand)

---

### Connection Events

#### `connected`
**Description**: Confirmation of successful connection

**Payload**:
```typescript
{
  socketId: string
  roomId?: string  // If reconnecting to existing room
  playerId?: string  // If reconnecting as existing player
}
```

**Broadcast**: Only to connecting client

**When Sent**: On Socket.io connection

---

#### `disconnected`
**Description**: Notification of player disconnection (sent to other players)

**Payload**:
```typescript
{
  playerId: string
  seatNumber: number
  hasChipsInPlay: boolean
}
```

**Broadcast**: All other clients in room

**When Sent**: On player socket disconnect

---

#### `reconnected`
**Description**: Notification that a player reconnected

**Payload**:
```typescript
{
  playerId: string
  seatNumber: number
}
```

**Broadcast**: All clients in room

**When Sent**: When disconnected player reconnects

---

## Event Mutability Matrix

| Event | Mutates State | Owner-Only | Broadcast Scope |
|-------|---------------|------------|-----------------|
| `join_room` | No | No | Requesting client only |
| `create_room` | Yes | N/A | Requesting client only |
| `take_seat` | Yes | No | All clients |
| `leave_seat` | Yes | No | All clients |
| `player_action` | Yes | No | All clients |
| `owner_start_hand` | Yes | Yes | All clients |
| `owner_advance_round` | Yes | Yes | All clients |
| `owner_assign_button` | Yes | Yes | All clients |
| `owner_force_fold` | Yes | Yes | All clients |
| `owner_adjust_stack` | Yes | Yes | All clients |
| `owner_undo` | Yes | Yes | All clients |
| `owner_end_hand` | Yes | Yes | All clients |
| `owner_reset_room` | Yes | Yes | All clients |
| `owner_kick_player` | Yes | Yes | All clients |
| `owner_select_winners` | Yes | Yes | All clients |
| `owner_update_config` | Yes | Yes | All clients |

---

## Event Validation Rules

### All Client → Server Events
1. Must include valid `roomId` (except `create_room`)
2. Must have valid socket connection
3. Must match expected payload structure (validated with Zod schemas)

### Player Action Events
1. Player must be seated
2. Player must be in active hand (if hand is running)
3. Action must be legal for current game state

### Owner Action Events
1. Socket ID must match `room.ownerId`
2. Action must be valid for current game state
3. Must not break state invariants

---

## Event Ordering & Idempotency

### Ordering
- Events processed sequentially per room (no concurrent mutations)
- Server maintains event log in chronological order
- Clients receive events in order via Socket.io

### Idempotency
- Action requests include client-side request ID (optional, for deduplication)
- Server validates state before each mutation (prevents duplicate processing)
- Event IDs are unique and immutable

---

## Example Event Flows

### Example 1: Player Takes Seat
```
Client A → Server: take_seat({ seatNumber: 3, username: "Alice", startingStack: 1000 })
Server:
  1. Validates request
  2. Mutates state (occupies seat, creates player)
  3. Logs event
  4. → Client A: action_ack({ success: true, eventId: "evt_123" })
  5. → All clients: room_state({ room: updatedState })
  6. → All clients: player_joined({ player: alice, seatNumber: 3 })
```

### Example 2: Player Makes Bet
```
Client A → Server: player_action({ action: "bet", amount: 50 })
Server:
  1. Validates (is it player's turn? valid amount? etc.)
  2. Mutates state (deducts chips, updates bet, advances action)
  3. Logs event
  4. → Client A: action_ack({ success: true, eventId: "evt_124" })
  5. → All clients: room_state({ room: updatedState })
```

### Example 3: Owner Starts Hand
```
Owner → Server: owner_start_hand({})
Server:
  1. Validates (≥2 players, no active hand)
  2. Mutates state (creates hand, posts blinds, starts preflop)
  3. Logs event
  4. → Owner: action_ack({ success: true, eventId: "evt_125" })
  5. → All clients: room_state({ room: updatedState })
  6. → All clients: hand_started({ handId: "hand_456", ... })
```

### Example 4: Player Disconnects
```
Client A disconnects (socket.io disconnect event)
Server:
  1. Detects disconnect
  2. Marks player as disconnected (preserves state if chips in play)
  3. → All other clients: disconnected({ playerId: "p_123", seatNumber: 3, hasChipsInPlay: true })
  4. → All clients: room_state({ room: updatedState })  // Updated connection status
```

---

**This document is the canonical definition of the Socket.io event protocol. All implementations must follow these event contracts exactly.**

