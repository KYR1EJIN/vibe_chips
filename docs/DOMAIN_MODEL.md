# Domain Model & State Design

## Overview

This document defines the core domain models, their responsibilities, fields, and invariants. These rules constitute the "constitution" of the game logic. **All implementations MUST maintain these invariants.**

---

## 1. Room

### Responsibilities
- Container for a poker game session
- Manages players, seats, and active hand
- Stores room configuration (blinds, max seats)
- Tracks room owner
- Maintains event log for undo functionality

### Key Fields
```
roomId: string                    // Unique identifier (e.g., "abc123")
ownerId: string                   // Socket ID of room creator
createdAt: number                 // Timestamp
config: {
  smallBlind: number              // Small blind amount
  bigBlind: number                // Big blind amount
  maxSeats: number                // Maximum seats (default 10)
}
seats: Seat[]                     // Array of 10 seats
players: Map<playerId, Player>    // Active players in room
currentHand: HandState | null     // Active hand, or null if in lobby
eventLog: Event[]                 // History of all state-changing events
```

### Invariants
- `roomId` MUST be unique across all active rooms
- `ownerId` MUST correspond to a valid socket connection
- `seats.length` MUST always equal `config.maxSeats` (typically 10)
- `players.size` MUST NOT exceed number of occupied seats
- `currentHand` can only be non-null if at least 2 players are seated
- `config.bigBlind` MUST be exactly 2x `config.smallBlind`
- All `players` MUST have a corresponding occupied `seat`
- `eventLog` MUST be append-only (events never deleted, only new events added)

---

## 2. Player

### Responsibilities
- Represents a user participating in the game
- Tracks chip stack and betting state
- Maintains connection state (connected/disconnected)
- Stores player identity (username, playerId)

### Key Fields
```
playerId: string                  // Unique within room (generated on seat take)
socketId: string                  // Current socket connection ID
username: string                  // Display name (unique per room)
seatNumber: number                // Seat position (1-10)
stack: number                     // Current chip count
currentBet: number                // Bet amount in current betting round
status: PlayerStatus              // active | folded | all-in | sitting-out | disconnected
isConnected: boolean              // Whether socket is currently connected
joinedAt: number                  // Timestamp when player took seat
```

### PlayerStatus Enum
```
- "active"         // Player is in hand and can act
- "folded"         // Player folded this hand
- "all-in"         // Player is all-in (cannot act further)
- "sitting-out"    // Player is seated but not in current hand
- "disconnected"   // Player lost connection but has chips in play
```

### Invariants
- `stack` MUST always be ≥ 0
- `currentBet` MUST always be ≥ 0
- `seatNumber` MUST be between 1 and `config.maxSeats` (inclusive)
- `username` MUST be unique within the room
- `playerId` MUST be unique within the room
- `status` CANNOT be "active" if `stack === 0` and `currentBet === 0`
- `status` CANNOT be "all-in" if `stack > 0`
- `currentBet` resets to 0 at the start of each new betting round
- If `isConnected === false` and player has chips in play, `status` MUST be preserved (not reset)

---

## 3. Seat

### Responsibilities
- Represents a physical position at the poker table
- Tracks occupancy and player assignment
- Provides visual state for UI rendering

### Key Fields
```
seatNumber: number                // Position at table (1-10)
isOccupied: boolean               // Whether seat has a player
playerId: string | null           // Assigned player ID, or null if empty
```

### Invariants
- `seatNumber` MUST be between 1 and `config.maxSeats` (inclusive)
- `isOccupied === true` if and only if `playerId !== null`
- `isOccupied === false` if and only if `playerId === null`
- Each `seatNumber` MUST be unique within a room
- If `playerId` is set, that `playerId` MUST exist in `room.players`
- A `playerId` can only be assigned to one seat at a time

---

## 4. Hand

### Responsibilities
- Represents one complete poker hand from setup to showdown
- Manages hand phases (pre-hand, preflop, flop, turn, river, showdown)
- Tracks dealer button position
- Manages betting rounds within the hand
- Tracks pots and side pots

### Key Fields
```
handId: string                    // Unique identifier for this hand
phase: HandPhase                  // Current phase of the hand
dealerButtonSeat: number          // Seat number with dealer button
smallBlindSeat: number            // Seat number posting small blind
bigBlindSeat: number              // Seat number posting big blind
currentBettingRound: BettingRound | null  // Active betting round
bettingRounds: BettingRound[]     // History of completed betting rounds
pots: Pot[]                       // Main pot + side pots
startedAt: number                 // Timestamp when hand started
endedAt: number | null            // Timestamp when hand ended (null if active)
```

### HandPhase Enum
```
- "pre-hand"      // Setting up blinds, assigning button
- "preflop"        // First betting round
- "flop"           // Second betting round (after 3 community cards)
- "turn"           // Third betting round (after 4th community card)
- "river"          // Fourth betting round (after 5th community card)
- "showdown"       // Owner selecting winners, distributing pots
- "completed"      // Hand finished, ready for reset
```

### Invariants
- `handId` MUST be unique within the room
- `phase` MUST progress sequentially: pre-hand → preflop → flop → turn → river → showdown → completed
- `dealerButtonSeat`, `smallBlindSeat`, `bigBlindSeat` MUST correspond to occupied seats
- `smallBlindSeat` MUST be left of `dealerButtonSeat` (wrapping around)
- `bigBlindSeat` MUST be left of `smallBlindSeat` (wrapping around)
- `currentBettingRound` MUST be non-null when `phase` is preflop/flop/turn/river
- `currentBettingRound` MUST be null when `phase` is pre-hand/showdown/completed
- `bettingRounds.length` MUST equal number of completed betting rounds
- `pots.length` MUST be ≥ 1 (at least main pot)
- `pots[0]` MUST always be the main pot
- `endedAt` MUST be null while hand is active, set when `phase === "completed"`
- All players who posted blinds MUST have `currentBet > 0` or be all-in

---

## 5. BettingRound

### Responsibilities
- Represents one round of betting within a hand
- Tracks action order and who has acted
- Enforces betting rules (minimum bet, minimum raise)
- Determines when betting round is complete

### Key Fields
```
roundType: RoundType              // preflop | flop | turn | river
roundId: string                   // Unique identifier for this round
actionSeat: number | null         // Seat number that should act next (null if complete)
highestBet: number                // Highest bet amount in this round
minimumRaise: number              // Minimum raise amount (size of last raise)
actions: Action[]                 // Actions taken in this round (chronological)
isComplete: boolean               // Whether betting round is finished
startedAt: number                 // Timestamp when round started
completedAt: number | null        // Timestamp when round completed
```

### RoundType Enum
```
- "preflop"  // First betting round
- "flop"     // Second betting round
- "turn"     // Third betting round
- "river"    // Fourth betting round
```

### Invariants
- `roundType` MUST match the hand's current phase
- `roundId` MUST be unique within the hand
- `highestBet` MUST be ≥ 0
- `minimumRaise` MUST be ≥ 0
- `actionSeat` MUST be null if `isComplete === true`
- `actionSeat` MUST be non-null if `isComplete === false` and there are active players
- `actionSeat` MUST correspond to an occupied seat with an active player
- `highestBet` MUST equal the maximum `currentBet` of all active players in the round
- `minimumRaise` MUST equal the size of the last raise (or big blind if no raises yet)
- `isComplete === true` when:
  - All active players have called the highest bet, OR
  - All active players except one have folded, OR
  - All active players are all-in
- `actions` MUST be in chronological order
- Each action in `actions` MUST have a valid `seatNumber` and `amount`
- `completedAt` MUST be null if `isComplete === false`, set when `isComplete === true`

---

## 6. Pot / SidePot

### Responsibilities
- Container for chips contributed by players
- Tracks which players are eligible to win the pot
- Supports main pot and side pots for all-in scenarios

### Key Fields
```
potId: string                     // Unique identifier for this pot
potType: "main" | "side"          // Main pot or side pot
amount: number                    // Total chips in pot
eligiblePlayerIds: string[]       // Player IDs eligible to win this pot
createdAt: number                 // Timestamp when pot was created
```

### Invariants
- `potId` MUST be unique within the hand
- `amount` MUST always be ≥ 0
- `eligiblePlayerIds.length` MUST be ≥ 1
- All `eligiblePlayerIds` MUST correspond to players who contributed to the pot
- Main pot (`potType === "main"`) MUST include all players who contributed
- Side pots (`potType === "side"`) MUST only include players who contributed above the all-in threshold
- Sum of all pot amounts MUST equal total chips contributed by all players in the hand
- Main pot MUST be created first (potId ordering or explicit flag)
- Side pots MUST be created in order of all-in thresholds (lowest to highest)

### Pot Creation Rules
- **Main pot**: Created at hand start, includes all players
- **Side pot**: Created when a player goes all-in and other players continue betting
- **Side pot eligibility**: Only players who contributed above the all-in amount are eligible

---

## 7. Action / Event

### Responsibilities
- Represents a state-changing event in the game
- Tracks who performed the action and when
- Stores action details for replay/undo
- Distinguishes between player actions and system events

### Key Fields
```
eventId: string                   // Unique identifier for this event
eventType: EventType              // Type of event
timestamp: number                 // When event occurred
actorId: string                   // Player ID or "system" for system events
roomId: string                    // Room where event occurred
handId: string | null             // Hand ID if event is hand-related
payload: ActionPayload            // Event-specific data
stateSnapshot: RoomState          // Full room state before this event (for undo)
```

### EventType Enum
```
// Player Actions
- "player_bet"
- "player_call"
- "player_raise"
- "player_check"
- "player_fold"
- "player_all_in"

// System Events
- "hand_started"
- "hand_ended"
- "round_advanced"
- "blinds_posted"
- "dealer_button_moved"
- "pot_created"
- "pot_distributed"

// Room Events
- "player_joined"
- "player_left"
- "seat_taken"
- "seat_left"
- "room_created"
- "room_reset"

// Owner Actions
- "owner_start_hand"
- "owner_advance_round"
- "owner_assign_button"
- "owner_force_fold"
- "owner_adjust_stack"
- "owner_undo"
- "owner_end_hand"
- "owner_reset_room"
- "owner_kick_player"
```

### ActionPayload Structure
Varies by eventType. Examples:
- Player actions: `{ seatNumber, amount?, action }`
- System events: `{ ...event-specific fields }`
- Owner actions: `{ ...action-specific fields }`

### Invariants
- `eventId` MUST be unique within the room
- `timestamp` MUST be monotonically increasing (events in chronological order)
- `actorId` MUST be a valid player ID or "system"
- `roomId` MUST correspond to an active room
- `handId` MUST be non-null for hand-related events, null for room-level events
- `stateSnapshot` MUST be a complete, valid `RoomState` at the time of the event
- Player action events MUST have `actorId` matching a player in the room
- Owner action events MUST have `actorId` matching the room owner
- System events MUST have `actorId === "system"`
- `payload` MUST match the structure expected for the `eventType`

---

## Cross-Model Invariants

### Room ↔ Player
- Every player in `room.players` MUST have a corresponding occupied seat
- Every occupied seat MUST have a player in `room.players`
- Player's `seatNumber` MUST match their assigned seat's `seatNumber`

### Room ↔ Hand
- `room.currentHand` can only be non-null if at least 2 players are seated
- All players in active hand MUST have `status` of "active" or "all-in" or "folded"
- Hand's `dealerButtonSeat`, `smallBlindSeat`, `bigBlindSeat` MUST be occupied seats

### Hand ↔ BettingRound
- `hand.currentBettingRound` MUST match `hand.phase` (non-null for preflop/flop/turn/river)
- `hand.bettingRounds.length` MUST equal number of completed rounds
- Each `bettingRound.roundType` MUST match its position in the hand sequence

### Hand ↔ Pot
- All pots MUST have `handId` matching the hand
- Sum of all pot amounts MUST equal total contributions from all players
- Main pot MUST always exist if hand has started

### Player ↔ BettingRound
- Player's `currentBet` MUST be ≤ `highestBet` in current betting round
- Player can only act if `actionSeat === player.seatNumber`
- Player's `status` determines if they can act (must be "active")

### Action ↔ State
- Every state mutation MUST be logged as an event
- Event's `stateSnapshot` MUST represent state before the mutation
- Undo operation MUST restore `stateSnapshot` from the event

---

## State Transition Rules

### Room State Transitions
```
Lobby (no hand)
  └─> [owner starts hand] ─> Hand Active

Hand Active
  └─> [hand completes] ─> Lobby (ready for next hand)
  └─> [owner resets] ─> Lobby (cleared)
```

### Hand Phase Transitions
```
pre-hand
  └─> [blinds posted] ─> preflop

preflop
  └─> [betting complete] ─> flop (if >1 player active)
  └─> [betting complete, 1 player] ─> showdown

flop
  └─> [betting complete] ─> turn (if >1 player active)
  └─> [betting complete, 1 player] ─> showdown

turn
  └─> [betting complete] ─> river (if >1 player active)
  └─> [betting complete, 1 player] ─> showdown

river
  └─> [betting complete] ─> showdown

showdown
  └─> [pots distributed] ─> completed

completed
  └─> [owner starts new hand] ─> pre-hand (new hand)
```

### Player Status Transitions
```
sitting-out
  └─> [hand starts] ─> active (if in hand)
  └─> [player acts] ─> active/folded/all-in

active
  └─> [player folds] ─> folded
  └─> [player goes all-in] ─> all-in
  └─> [hand ends] ─> sitting-out (reset for next hand)

folded
  └─> [hand ends] ─> sitting-out (reset for next hand)

all-in
  └─> [hand ends] ─> sitting-out (reset for next hand)
```

---

## Critical Business Rules

### Betting Rules
- **Minimum bet** = big blind
- **Minimum raise** = size of last raise (or big blind if no raises)
- **All-in below minimum raise** does NOT reopen action
- **Betting round ends** when all active players have called highest bet OR all but one folded OR all are all-in

### Pot Rules
- **Main pot** always includes all players who contributed
- **Side pots** created when player goes all-in and others continue betting
- **Side pot eligibility** = players who contributed above the all-in threshold
- **Pot distribution** happens only at showdown

### Action Order
- **Preflop**: Starts left of big blind
- **Postflop**: Starts left of dealer button
- **Skips** folded and all-in players
- **Wraps around** table (seat 10 → seat 1)

### Blind Rules
- **Small blind** = left of dealer button
- **Big blind** = left of small blind
- **Blinds automatically deducted** from stacks
- **If stack < blind amount**, player goes all-in for that amount

### Connection Rules
- **Disconnected player with chips in play**: Preserve seat and stack
- **Disconnected player with no chips**: Optionally free seat (TBD)
- **Reconnecting player**: Restore to same seat if available

---

**This document defines the immutable rules of the game logic. All code implementations MUST maintain these invariants and follow these business rules.**

