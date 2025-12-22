# Architecture Documentation

## System Overview

ChipTable is a real-time, chip-only Texas Hold'em poker simulator built as a web application. The system uses an authoritative server architecture where the server maintains the single source of truth for all game state. Clients connect via WebSocket (Socket.io) and render UI based on server state snapshots. All game logic, betting rules, and state mutations occur server-side. Clients send action requests and receive state updates in real-time.

The system is designed for zero authentication, link-based room access, and temporary game sessions. Rooms are in-memory only (no persistence in v1). The architecture prioritizes correctness, real-time synchronization, and mobile-friendly responsive design.

## Tech Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: React Context + useReducer (UI state only); Server state via WebSocket subscriptions
- **Build Tool**: Vite
- **Real-time**: Socket.io-client

### Backend
- **Framework**: Node.js with Express + TypeScript
- **Real-time**: Socket.io (WebSocket abstraction)
- **State Management**: In-memory Maps + event sourcing (for undo)
- **Validation**: Zod schemas
- **Build Tool**: TypeScript compiler (tsc)

### Shared
- **Types**: TypeScript types shared between client and server
- **Schemas**: Zod validation schemas
- **Constants**: Shared game constants

### Deployment
- **Target**: Railway or Fly.io (single Node.js service)
- **Alternative**: Vercel (frontend) + separate backend service for WebSockets

## Client vs Server Responsibilities

### Client Responsibilities
1. **UI Rendering**: Display table, seats, chips, pots, betting controls
2. **Action Requests**: Send user actions (bet, fold, call, etc.) to server
3. **Local UI State**: Manage modals, form inputs, temporary UI state
4. **Connection Management**: Handle Socket.io connection/reconnection
5. **Optimistic UI** (optional): Show pending states, but always reconcile with server

### Server Responsibilities
1. **Game State Authority**: Single source of truth for all game data
2. **Action Validation**: Enforce betting rules, turn order, permissions
3. **State Mutation**: Update game state only after validation
4. **Event Broadcasting**: Push state changes to all room participants
5. **Room Lifecycle**: Create/destroy rooms, manage player connections
6. **Business Logic**: Betting rules, pot calculation, side pot creation

## Authoritative Server Model

All game state lives on the server in memory:

```
Server Memory:
├── rooms: Map<roomId, RoomState>
│   ├── RoomState {
│   │   ├── roomId: string
│   │   ├── ownerId: string (socket.id)
│   │   ├── config: { blinds, maxSeats }
│   │   ├── seats: Seat[] (10 seats)
│   │   ├── players: Map<playerId, Player>
│   │   ├── currentHand: HandState | null
│   │   ├── eventLog: Event[] (for undo)
│   │   └── createdAt: timestamp
│   }
└── connections: Map<socketId, { roomId, playerId, role }>
```

Clients never mutate game state directly. They:
- Receive state snapshots via Socket.io events
- Send action requests
- Render based on received state

## State Ownership Rules

1. **Server is authoritative**: All game state mutations happen server-side
2. **Clients are stateless**: Clients can reconnect and restore state from server
3. **Eventual consistency**: Clients may briefly show stale state, but server broadcasts correct state
4. **Idempotent actions**: Same action sent twice should not break state (validation prevents duplicates)
5. **Event sourcing lite**: Event log enables undo functionality
6. **Room isolation**: Each room is independent; no cross-room state

## Room Lifecycle

```
Room Creation
    │
    ├─> Lobby State (waiting for players)
    │   ├─> Players join and take seats
    │   └─> Owner configures blinds
    │
    ├─> Hand Active State
    │   ├─> Pre-hand setup (blinds posted)
    │   ├─> Betting rounds (preflop → flop → turn → river)
    │   ├─> Showdown (owner selects winners)
    │   └─> Hand reset (back to lobby or next hand)
    │
    └─> Room Destroyed
        ├─> Owner resets room
        ├─> All players leave
        └─> Room garbage collected (after timeout)
```

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   React UI   │  │   React UI   │  │   React UI   │  ...    │
│  │  Components  │  │  Components  │  │  Components  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
│  ┌──────▼──────────────────▼──────────────────▼───────┐         │
│  │         Client State (UI only)                     │         │
│  │  - Modals, form inputs, temporary UI state        │         │
│  └──────┬──────────────────┬──────────────────┬───────┘         │
│         │                  │                  │                 │
│  ┌──────▼──────────────────▼──────────────────▼───────┐         │
│  │         Socket.io Client                            │         │
│  │  - Connection management                            │         │
│  │  - Action requests                                 │         │
│  │  - State subscriptions                             │         │
│  └─────────────────────────────────────────────────────┘         │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                    WebSocket (Socket.io)
                            │
┌───────────────────────────▼───────────────────────────────────────┐
│                         SERVER LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Socket.io Server                            │   │
│  │  - Connection handling                                   │   │
│  │  - Room-based messaging                                 │   │
│  │  - Event routing                                         │   │
│  └───────────────────┬──────────────────────────────────────┘   │
│                      │                                            │
│  ┌───────────────────▼──────────────────────────────────────┐   │
│  │              Request Handlers                             │   │
│  │  - joinRoom()                                             │   │
│  │  - takeSeat()                                             │   │
│  │  - playerAction()                                         │   │
│  │  - ownerAction()                                          │   │
│  └───────────────────┬──────────────────────────────────────┘   │
│                      │                                            │
│  ┌───────────────────▼──────────────────────────────────────┐   │
│  │              Game Logic Layer                             │   │
│  │  - Action validation                                      │   │
│  │  - Betting rules engine                                  │   │
│  │  - Pot calculation                                        │   │
│  │  - Side pot creation                                      │   │
│  │  - Hand lifecycle management                              │   │
│  └───────────────────┬──────────────────────────────────────┘   │
│                      │                                            │
│  ┌───────────────────▼──────────────────────────────────────┐   │
│  │              State Management                             │   │
│  │                                                            │   │
│  │  rooms: Map<roomId, RoomState>                            │   │
│  │  ├── RoomState {                                          │   │
│  │  │   ├── seats: Seat[]                                    │   │
│  │  │   ├── players: Map<playerId, Player>                  │   │
│  │  │   ├── currentHand: HandState | null                    │   │
│  │  │   └── eventLog: Event[]                               │   │
│  │  }                                                         │   │
│  │                                                            │   │
│  │  connections: Map<socketId, ConnectionInfo>               │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Broadcast Manager                           │   │
│  │  - Emit state updates to all room participants           │   │
│  │  - Handle reconnection state sync                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Real-Time Update Flow

### Action Request Flow
```
Client A                    Server                    All Clients
   |                          |                           |
   |--[action: "bet"]-------->|                           |
   |                          |--[validate]                |
   |                          |--[mutate state]            |
   |                          |--[log event]               |
   |<--[ack: success]---------|                           |
   |                          |--[broadcast: stateUpdate]->|
   |                          |                           |--[render new state]
   |<--[broadcast: stateUpdate]                           |
   |--[render new state]      |                           |
```

### State Synchronization
- **On connect**: Server sends full room state snapshot
- **On action**: Server broadcasts delta updates (or full state for simplicity in v1)
- **On reconnect**: Server restores player's seat and stack from room state

## Connection & Reconnection Strategy

### On Connect
- Client sends `joinRoom(roomId)` with optional `playerId` (if reconnecting)
- Server looks up room, finds player by `playerId` or creates new connection
- Server sends full `roomState` snapshot
- Client renders table with current state

### On Disconnect
- Server marks connection as disconnected
- If player has chips in play: Preserve seat and stack, mark as "disconnected"
- If player has no chips: Optionally free seat (or preserve for rejoin)
- Broadcast `playerLeft` to other clients

### On Reconnect
- Client sends `joinRoom(roomId, playerId)`
- Server restores player to their seat
- Server sends full state snapshot
- Player can continue if hand is still active

## Design Principles

1. **Authoritative Server**: All game logic and state mutations occur server-side
2. **Event Sourcing Lite**: Event log enables undo functionality and state replay
3. **Room Isolation**: Each room is completely independent; no shared state
4. **Type Safety**: TypeScript + Zod for compile-time and runtime validation
5. **Real-Time First**: Socket.io events designed before implementation
6. **Mobile-Ready**: Responsive design from the start
7. **Stateless Clients**: Clients can reconnect and restore state from server
8. **No Premature Optimization**: Focus on correctness first, optimize later

## Why This Architecture

### Fits the PRD
- Real-time multiplayer: Socket.io handles WebSocket connections and reconnection
- Authoritative server: Node.js/Express centralizes game logic
- Mobile-friendly: React + Tailwind responsive design
- iOS App Store ready: Can wrap with Capacitor or React Native later
- LLM-friendly: Common patterns, strong TypeScript support
- Minimal infrastructure: Single Node.js service, no database for v1
- Fast iteration: Hot reload, TypeScript errors, simple deployment

### Alternatives Rejected
- **Python backend**: Less common for WebSocket apps, slower for real-time
- **Go backend**: More verbose, slower iteration
- **Next.js API routes**: Couples frontend/backend deployment
- **Native WebSocket**: More manual error handling than Socket.io
- **Redis**: Unnecessary for single-server v1
- **Database**: Overkill for temporary rooms

---

**This document is the authoritative source for all architectural decisions. All implementations must adhere to these principles.**

