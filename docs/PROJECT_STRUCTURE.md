# Project Structure

## Overview

This document defines the canonical repository structure for ChipTable. All code must be organized according to this structure. This ensures consistency, maintainability, and LLM-friendly navigation.

---

## Repository Structure

```
vibe_chips/
├── README.md
├── package.json
├── tsconfig.json
├── .gitignore
├── .env.example
│
├── client/                          # Frontend React application
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   │
│   ├── src/
│   │   ├── main.tsx                 # Entry point
│   │   ├── App.tsx                  # Root component
│   │   │
│   │   ├── components/              # React UI components
│   │   │   ├── common/              # Reusable UI primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── ChipDisplay.tsx
│   │   │   │
│   │   │   ├── room/                # Room-level components
│   │   │   │   ├── RoomLobby.tsx
│   │   │   │   ├── RoomLink.tsx
│   │   │   │   └── RoomConfig.tsx
│   │   │   │
│   │   │   ├── table/               # Poker table components
│   │   │   │   ├── PokerTable.tsx
│   │   │   │   ├── Seat.tsx
│   │   │   │   ├── DealerButton.tsx
│   │   │   │   └── PotDisplay.tsx
│   │   │   │
│   │   │   ├── betting/             # Betting UI components
│   │   │   │   ├── BettingControls.tsx
│   │   │   │   ├── ActionButton.tsx
│   │   │   │   ├── BetInput.tsx
│   │   │   │   └── BettingStatus.tsx
│   │   │   │
│   │   │   ├── owner/               # Owner-only components
│   │   │   │   ├── OwnerControls.tsx
│   │   │   │   ├── HandControls.tsx
│   │   │   │   ├── PlayerManagement.tsx
│   │   │   │   └── UndoButton.tsx
│   │   │   │
│   │   │   └── modals/              # Modal dialogs
│   │   │       ├── SeatModal.tsx
│   │   │       ├── WinnerModal.tsx
│   │   │       └── ConfirmModal.tsx
│   │   │
│   │   ├── hooks/                   # React hooks
│   │   │   ├── useSocket.ts         # Socket.io connection hook
│   │   │   ├── useRoomState.ts      # Room state subscription
│   │   │   ├── usePlayer.ts         # Current player context
│   │   │   └── useOwner.ts          # Owner permissions check
│   │   │
│   │   ├── context/                 # React context providers
│   │   │   ├── SocketContext.tsx    # Socket.io instance
│   │   │   ├── RoomContext.tsx      # Current room state
│   │   │   └── PlayerContext.tsx    # Current player identity
│   │   │
│   │   ├── pages/                   # Page-level components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── RoomPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   │
│   │   ├── utils/                   # Client-side utilities
│   │   │   ├── formatting.ts        # Chip formatting, currency
│   │   │   ├── validation.ts       # Client-side input validation
│   │   │   └── constants.ts         # Client constants
│   │   │
│   │   └── styles/                  # Styling
│   │       ├── globals.css
│   │       └── tailwind.config.js
│   │
│   └── public/                      # Static assets
│       └── favicon.ico
│
├── server/                          # Backend Node.js application
│   ├── package.json
│   ├── tsconfig.json
│   ├── server.ts                    # Entry point
│   │
│   ├── src/
│   │   ├── index.ts                 # Server initialization
│   │   │
│   │   ├── socket/                  # Socket.io setup & handlers
│   │   │   ├── socketServer.ts      # Socket.io server setup
│   │   │   ├── connectionHandler.ts # Connection lifecycle
│   │   │   ├── roomHandlers.ts      # Room join/leave handlers
│   │   │   ├── playerHandlers.ts    # Player action handlers
│   │   │   └── ownerHandlers.ts     # Owner action handlers
│   │   │
│   │   ├── game/                    # Core game logic
│   │   │   ├── state/               # Game state management
│   │   │   │   ├── roomState.ts     # Room state class/model
│   │   │   │   ├── handState.ts     # Hand state class/model
│   │   │   │   ├── playerState.ts   # Player state class/model
│   │   │   │   └── stateManager.ts  # Central state storage
│   │   │   │
│   │   │   ├── betting/             # Betting engine
│   │   │   │   ├── bettingEngine.ts # Core betting logic
│   │   │   │   ├── actionValidator.ts # Action validation
│   │   │   │   ├── actionProcessor.ts # Action execution
│   │   │   │   └── bettingRules.ts  # Texas Hold'em rules
│   │   │   │
│   │   │   ├── pots/                # Pot management
│   │   │   │   ├── potCalculator.ts # Pot calculation logic
│   │   │   │   ├── sidePotCreator.ts # Side pot creation
│   │   │   │   └── potDistributor.ts # Pot distribution logic
│   │   │   │
│   │   │   ├── hands/               # Hand lifecycle
│   │   │   │   ├── handManager.ts   # Hand creation/advancement
│   │   │   │   ├── handPhases.ts    # Phase transitions
│   │   │   │   └── dealerButton.ts  # Dealer button rotation
│   │   │   │
│   │   │   └── seats/               # Seat management
│   │   │       ├── seatManager.ts   # Seat assignment logic
│   │   │       └── seatValidator.ts # Seat validation
│   │   │
│   │   ├── events/                  # Event system
│   │   │   ├── eventTypes.ts        # Event type definitions
│   │   │   ├── eventEmitter.ts      # Event broadcasting
│   │   │   ├── eventLog.ts          # Event logging for undo
│   │   │   └── eventValidator.ts    # Event validation
│   │   │
│   │   ├── room/                    # Room lifecycle
│   │   │   ├── roomManager.ts       # Room creation/destruction
│   │   │   ├── roomFactory.ts       # Room initialization
│   │   │   └── roomCleanup.ts       # Room garbage collection
│   │   │
│   │   ├── validation/             # Server-side validation
│   │   │   ├── actionValidation.ts  # Action input validation
│   │   │   ├── roomValidation.ts    # Room config validation
│   │   │   └── playerValidation.ts  # Player input validation
│   │   │
│   │   ├── utils/                   # Server utilities
│   │   │   ├── idGenerator.ts       # Room ID, hand ID generation
│   │   │   ├── errorHandler.ts      # Error handling utilities
│   │   │   └── constants.ts         # Server constants
│   │   │
│   │   └── types/                   # Server-specific types
│   │       └── serverTypes.ts       # Internal server types
│   │
│   └── tests/                       # Server tests (future)
│
├── shared/                          # Shared code between client & server
│   ├── package.json
│   ├── tsconfig.json
│   │
│   └── src/
│       ├── types/                   # Shared TypeScript types
│       │   ├── room.ts              # Room, Seat types
│       │   ├── player.ts            # Player types
│       │   ├── hand.ts              # Hand, BettingRound types
│       │   ├── pot.ts               # Pot, SidePot types
│       │   ├── action.ts            # Action, Event types
│       │   └── socket.ts            # Socket event types
│       │
│       ├── schemas/                 # Zod validation schemas
│       │   ├── roomSchemas.ts       # Room validation schemas
│       │   ├── playerSchemas.ts    # Player validation schemas
│       │   ├── actionSchemas.ts    # Action validation schemas
│       │   └── socketSchemas.ts    # Socket event schemas
│       │
│       ├── constants/               # Shared constants
│       │   ├── gameConstants.ts    # Game rules constants
│       │   ├── tableConstants.ts   # Table configuration
│       │   └── actionConstants.ts  # Action type constants
│       │
│       └── utils/                   # Shared utilities
│           ├── formatting.ts        # Shared formatting functions
│           └── validation.ts        # Shared validation helpers
│
└── docs/                            # Documentation
    ├── ARCHITECTURE.md              # Architecture documentation
    ├── DOMAIN_MODEL.md              # Domain models and invariants
    ├── EVENTS.md                    # Socket API documentation
    ├── PROJECT_STRUCTURE.md         # This file
    └── DEVELOPMENT_PLAN.md          # Development roadmap
```

---

## Folder Explanations

### Client Structure

#### `client/src/components/`
React UI components organized by feature domain:
- **`common/`**: Reusable UI primitives (Button, Modal, Input, ChipDisplay)
- **`room/`**: Room-level UI (lobby, link sharing, configuration)
- **`table/`**: Poker table visualization (seats, dealer button, pots)
- **`betting/`**: Betting controls and status displays
- **`owner/`**: Owner-only controls (hand management, undo, player management)
- **`modals/`**: Modal dialogs (seat selection, winner selection, confirmations)

#### `client/src/hooks/`
Custom React hooks for Socket.io, room state, player context. Encapsulates connection and state subscription logic.

#### `client/src/context/`
React Context providers for global state (Socket instance, room state, player identity).

#### `client/src/pages/`
Top-level page components (routing targets).

#### `client/src/utils/`
Client-only utilities (formatting, validation, constants).

---

### Server Structure

#### `server/src/socket/`
Socket.io setup and event handlers, separated by concern:
- **`socketServer.ts`**: Socket.io server initialization
- **`connectionHandler.ts`**: Connection lifecycle management
- **`roomHandlers.ts`**: Room join/leave event handlers
- **`playerHandlers.ts`**: Player action event handlers
- **`ownerHandlers.ts`**: Owner action event handlers

#### `server/src/game/state/`
Core state classes/models:
- **`roomState.ts`**: Room state container class
- **`handState.ts`**: Hand state container class
- **`playerState.ts`**: Player state container class
- **`stateManager.ts`**: Central in-memory storage (Map<roomId, RoomState>)

#### `server/src/game/betting/`
Betting engine logic:
- **`bettingEngine.ts`**: Orchestrates betting flow
- **`actionValidator.ts`**: Validates actions against rules
- **`actionProcessor.ts`**: Executes validated actions
- **`bettingRules.ts`**: Texas Hold'em rule constants and helpers

#### `server/src/game/pots/`
Pot calculation and management:
- **`potCalculator.ts`**: Main pot calculation logic
- **`sidePotCreator.ts`**: Side pot creation when players go all-in
- **`potDistributor.ts`**: Pot distribution logic (for showdown)

#### `server/src/game/hands/`
Hand lifecycle management:
- **`handManager.ts`**: Hand creation, phase transitions
- **`handPhases.ts`**: Phase transition logic
- **`dealerButton.ts`**: Dealer button rotation logic

#### `server/src/game/seats/`
Seat assignment and validation:
- **`seatManager.ts`**: Seat take/leave logic
- **`seatValidator.ts`**: Seat availability, username uniqueness validation

#### `server/src/events/`
Event system for broadcasting and undo:
- **`eventTypes.ts`**: Event type definitions
- **`eventEmitter.ts`**: Broadcasting to room participants
- **`eventLog.ts`**: Event logging for undo functionality
- **`eventValidator.ts`**: Event payload validation

#### `server/src/room/`
Room lifecycle management:
- **`roomManager.ts`**: Room creation, lookup, destruction
- **`roomFactory.ts`**: Room initialization with defaults
- **`roomCleanup.ts`**: Garbage collection for empty rooms

#### `server/src/validation/`
Server-side input validation (validates all incoming Socket.io events before processing).

#### `server/src/utils/`
Server-only utilities (ID generation, error handling).

---

### Shared Structure

#### `shared/src/types/`
TypeScript types used by both client and server, organized by domain (room, player, hand, pot, action, socket).

#### `shared/src/schemas/`
Zod schemas for runtime validation. Used by server to validate Socket.io events. Can be used by client for form validation.

#### `shared/src/constants/`
Shared constants (game rules, table configuration, action types).

#### `shared/src/utils/`
Shared utility functions (formatting, validation helpers).

---

## Naming Conventions

### Files
- **Components**: `PascalCase.tsx` (e.g., `PokerTable.tsx`)
- **Utilities/Logic**: `camelCase.ts` (e.g., `bettingEngine.ts`)
- **Types**: `camelCase.ts` (e.g., `room.ts`)
- **Constants**: `camelCase.ts` (e.g., `gameConstants.ts`)

### Code
- **Classes**: `PascalCase` (e.g., `RoomState`, `BettingEngine`)
- **Functions**: `camelCase` (e.g., `validateAction`, `calculatePot`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_SEATS`, `MIN_BET`)
- **Types/Interfaces**: `PascalCase` (e.g., `Player`, `BettingRound`)
- **Private members**: `_camelCase` (e.g., `_validateTurn()`)

### Folders
- **Feature folders**: `camelCase` (e.g., `betting/`, `room/`)
- **Component folders**: `PascalCase` if grouping by component type (e.g., `components/`)

---

## Separation of Concerns

### Client
- **UI rendering only**: No game logic, no state mutations
- **Action requests**: Send events to server, receive state updates
- **Local UI state**: Modals, form inputs, temporary UI state

### Server
- **All game logic**: Betting rules, pot calculation, state management
- **State authority**: Single source of truth for all game data
- **Validation**: All input validation, rule enforcement

### Shared
- **Type definitions**: Shared TypeScript types
- **Validation schemas**: Zod schemas for runtime validation
- **Constants**: Shared game constants
- **Utilities**: Shared formatting/validation helpers

---

## Design Rationale

### Monorepo Structure
- **Clear boundaries**: Separate `client/`, `server/`, `shared/` packages
- **Type safety**: Shared types prevent client/server drift
- **Independent deployment**: Can deploy separately if needed

### Feature-Based Organization
- **`game/betting/`**, **`game/pots/`**, **`game/hands/`** separate concerns
- **Easy to locate**: Logic is where you expect it
- **Easy to modify**: Changes are isolated to specific features

### Shared Package
- **Single source of truth**: Types and schemas defined once
- **Type safety**: Compile-time and runtime validation
- **Consistency**: Prevents client/server type drift

### Socket Handlers Separation
- **`roomHandlers.ts`**, **`playerHandlers.ts`**, **`ownerHandlers.ts`** separate concerns
- **Easy to reason about**: Each file handles one category of events
- **Easy to test**: Isolated handler logic

### State Classes vs Plain Objects
- **Classes encapsulate behavior**: Methods for state mutations
- **Easier to enforce invariants**: Validation in class methods
- **Clearer intent**: State management is explicit

### Event System Separation
- **`events/` folder**: Handles broadcasting and logging separately from game logic
- **Clear separation**: Game logic focuses on state mutations
- **Undo support**: Event log enables undo functionality

---

## Where New Code Goes

### Adding a New UI Component
- **Feature component**: `client/src/components/{feature}/NewComponent.tsx`
- **Common component**: `client/src/components/common/NewComponent.tsx`

### Adding a New Game Feature
- **Game logic**: `server/src/game/{feature}/`
- **State models**: `server/src/game/state/`
- **Socket handlers**: `server/src/socket/{feature}Handlers.ts`

### Adding a New Socket Event
- **Handler**: `server/src/socket/{category}Handlers.ts`
- **Types**: `shared/src/types/socket.ts`
- **Schema**: `shared/src/schemas/socketSchemas.ts`
- **Client hook**: `client/src/hooks/use{Feature}.ts`

### Adding a New Validation Rule
- **Server validation**: `server/src/validation/{category}Validation.ts`
- **Shared schema**: `shared/src/schemas/{category}Schemas.ts`

### Adding a New Constant
- **Game constants**: `shared/src/constants/gameConstants.ts`
- **Client constants**: `client/src/utils/constants.ts`
- **Server constants**: `server/src/utils/constants.ts`

---

## Scalability Considerations

- **Adding new features**: Create new folders in `game/` or `components/`
- **Adding new Socket events**: Add handlers in `socket/`, types in `shared/types/`
- **Adding persistence**: Create `server/src/persistence/` without changing game logic
- **Adding tests**: Mirror structure in `server/tests/` and `client/tests/`
- **Mobile app**: `client/` can be wrapped with Capacitor; minimal changes needed

---

**This document is the canonical definition of project structure. All code must be organized according to this structure.**

