# ChipTable - Phase 0: Infrastructure & Setup

## Overview

ChipTable is a real-time, chip-only Texas Hold'em poker simulator. This repository is currently in **Phase 0: Infrastructure & Setup**, which establishes the foundational structure and tooling for the project.

## Repository Structure

This is a monorepo with three main packages:

- **`client/`** - React + TypeScript frontend (Vite)
- **`server/`** - Node.js + Express + Socket.io backend
- **`shared/`** - Shared TypeScript types and utilities

See `docs/PROJECT_STRUCTURE.md` for the complete structure definition.

## What Phase 0 Includes

✅ **Monorepo Setup**
- Workspace configuration with npm workspaces
- Separate packages for client, server, and shared code

✅ **Tooling & Configuration**
- TypeScript configured for all packages
- ESLint + Prettier for code quality
- Development scripts for hot reload

✅ **Frontend Setup**
- React 18 + TypeScript + Vite
- Tailwind CSS configured
- Basic landing page placeholder
- Socket.io client connection
- Connection status indicator (connected/disconnected)

✅ **Backend Setup**
- Express server with TypeScript
- Socket.io server initialized
- Health check endpoint (`GET /health`)
- Connection lifecycle logging (connect/disconnect only)

✅ **Shared Package**
- Placeholder type files for future phases
- Placeholder Zod schema files
- Package structure ready for shared code

## What is NOT Implemented (Yet)

❌ **Room Management** - Will be implemented in Phase 1
❌ **Seating System** - Will be implemented in Phase 1
❌ **Betting Logic** - Will be implemented in Phase 2
❌ **Pot Calculation** - Will be implemented in Phase 3
❌ **Owner Controls** - Will be implemented in Phase 4
❌ **Showdown & Polish** - Will be implemented in Phase 5

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Environment Variables

Create a `.env` file in the root directory (optional for Phase 0):
```
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

The server will use defaults if `.env` is not present.

### Installation

```bash
# Install dependencies for all packages
npm install
```

### Running Development Environment

```bash
# Start both client and server concurrently
npm run dev
```

This will:
- Start the server on `http://localhost:3000`
- Start the client dev server on `http://localhost:5173`
- Enable hot reload for both

### Individual Package Scripts

```bash
# Client only
npm run dev --workspace=client

# Server only
npm run dev --workspace=server

# Build all packages
npm run build

# Type check all packages
npm run type-check

# Lint all packages
npm run lint
```

## Verification

To verify Phase 0 is working correctly:

1. **Start the development environment**: `npm run dev`
2. **Open the client**: Navigate to `http://localhost:5173`
3. **Check connection status**: You should see a green "Connected" indicator in the top-right
4. **Check server logs**: You should see connection logs in the server console
5. **Test health endpoint**: Visit `http://localhost:3000/health` - should return `{"status":"ok",...}`

## Project Documentation

All architectural and domain decisions are documented in the `docs/` directory:

- **`PRD.md`** - Product Requirements Document
- **`docs/ARCHITECTURE.md`** - System architecture and design principles
- **`docs/DOMAIN_MODEL.md`** - Domain models and invariants
- **`docs/EVENTS.md`** - Socket.io event protocol
- **`docs/PROJECT_STRUCTURE.md`** - Repository structure definition
- **`docs/DEVELOPMENT_PLAN.md`** - Phase-by-phase development roadmap

## Next Steps

Phase 0 is complete when:
- ✅ Client connects to server via Socket.io
- ✅ Server logs connection events
- ✅ Client shows connection status
- ✅ Project builds without TypeScript errors

**Do not proceed to Phase 1 until explicitly asked.**

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Socket.io-client
- **Backend**: Node.js, Express, TypeScript, Socket.io
- **Shared**: TypeScript, Zod (for validation)
- **Tooling**: ESLint, Prettier, npm workspaces

## License

Private project - not for distribution.

