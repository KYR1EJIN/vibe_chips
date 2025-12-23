# 🎰 Vibe Chips

> A real-time, chip-only Texas Hold'em poker simulator for in-person games

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)

## 📋 Table of Contents

- [🎰 Vibe Chips](#-vibe-chips)
  - [📋 Table of Contents](#-table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Repository Structure](#repository-structure)
  - [Implemented Features](#implemented-features)
  - [Planned Features](#planned-features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Development](#development)
    - [Running the Development Environment](#running-the-development-environment)
    - [Available Scripts](#available-scripts)
    - [Verification](#verification)
  - [Project Documentation](#project-documentation)
  - [Project Status](#project-status)
  - [Technology Stack](#technology-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Shared](#shared)
    - [Tooling](#tooling)
  - [Contributing](#contributing)
  - [License](#license)

## Overview

**Vibe Chips** is a real-time, chip-only Texas Hold'em poker simulator designed for in-person poker games. The app replaces physical poker chips and handles betting mechanics, pot management, and game state synchronization, while players use their own physical cards. Perfect for home games where you have cards but no chips.

## Features

- 🎮 **Real-time Multiplayer** - WebSocket-based gameplay with instant synchronization
- 🔗 **Instant Room Creation** - Shareable links with no registration required
- 🪑 **Flexible Seating** - Support for up to 10 players
- 💰 **Full Betting Engine** - Complete Texas Hold'em betting rules enforcement
- 👑 **Room Management** - Owner controls for game administration
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🎯 **Authoritative Server** - Ensures game state consistency and fairness

**Current Status:** 🚧 Phase 2 (Betting Engine) - In Progress

## Repository Structure

This is a monorepo with three main packages:

- **`client/`** - React + TypeScript frontend (Vite)
- **`server/`** - Node.js + Express + Socket.io backend
- **`shared/`** - Shared TypeScript types and utilities

See `docs/PROJECT_STRUCTURE.md` for the complete structure definition.

## Implemented Features

✅ **Phase 1: Room & Seating** (Complete)
- Room creation and joining via shareable links
- Seating system with validation (up to 10 players)
- Username uniqueness enforcement
- Room configuration (blinds)
- Owner identification and controls
- Real-time state synchronization

✅ **Phase 2: Betting Engine** (In Progress)
- Betting rules engine (minimum bet, minimum raise)
- Action validation (turn order, amount, status checks)
- Action processing (bet, call, raise, check, fold, all-in)
- Betting round state management
- Turn order management
- Hand creation and lifecycle
- Client betting UI

## Planned Features

🚧 **Phase 3: Pot Calculation** (Not Started)
- Main pot and side pot calculation
- All-in scenario handling
- Pot distribution logic

🚧 **Phase 4: Owner Controls** (Not Started)
- Advanced owner actions (undo, force fold, adjust stacks)
- Hand advancement controls
- Dealer button management

🚧 **Phase 5: Showdown & Polish** (Not Started)
- Showdown phase
- Winner selection UI
- Hand history
- Final polish and edge case handling

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Git**

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vibe_chips.git
cd vibe_chips
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
   
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```
   
   The server will use defaults if `.env` is not present.

## Development

### Running the Development Environment

Start both client and server concurrently:

```bash
npm run dev
```

This will:
- Start the server on `http://localhost:3000`
- Start the client dev server on `http://localhost:5173`
- Enable hot reload for both

### Available Scripts

```bash
# Development
npm run dev                    # Start both client and server
npm run dev --workspace=client # Client only
npm run dev --workspace=server # Server only

# Build
npm run build                  # Build all packages

# Quality Checks
npm run type-check             # Type check all packages
npm run lint                   # Lint all packages
```

### Verification

To verify the setup is working correctly:

1. Start the development environment: `npm run dev`
2. Open the client: Navigate to `http://localhost:5173`
3. Check connection status: You should see a green "Connected" indicator in the top-right
4. Check server logs: You should see connection logs in the server console
5. Test health endpoint: Visit `http://localhost:3000/health` - should return `{"status":"ok",...}`

## Project Documentation

All architectural and domain decisions are documented in the `docs/` directory:

| Document | Description |
|----------|-------------|
| [`PRD.md`](PRD.md) | Product Requirements Document |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture and design principles |
| [`docs/DOMAIN_MODEL.md`](docs/DOMAIN_MODEL.md) | Domain models and invariants |
| [`docs/EVENTS.md`](docs/EVENTS.md) | Socket.io event protocol |
| [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md) | Repository structure definition |
| [`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md) | Phase-by-phase development roadmap |
| [`docs/PHASE_2_ASSESSMENT.md`](docs/PHASE_2_ASSESSMENT.md) | Phase 2 status and known issues |

## Project Status

**Current Phase:** Phase 2 (Betting Engine) 🚧

The project has completed Phase 1 (Room & Seating) and is currently implementing Phase 2 (Betting Engine). See [`docs/PHASE_2_ASSESSMENT.md`](docs/PHASE_2_ASSESSMENT.md) for detailed status and known issues.

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Socket.io-client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Socket.io** - WebSocket server

### Shared
- **TypeScript** - Shared types and utilities
- **Zod** - Runtime validation

### Tooling
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **npm workspaces** - Monorepo management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is currently unlicensed. All rights reserved.

If you'd like to use a specific license, please add a `LICENSE` file to the repository root.

