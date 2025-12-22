# Development Plan

## Overview

This document provides the step-by-step development roadmap for ChipTable v1. Each phase builds on the previous one and produces a testable milestone.

---

## Phase 0: Infrastructure & Setup

**Goals**: Set up project structure, build tools, dependencies, and basic client-server connection.

**What to Implement**:
1. Monorepo structure (`client/`, `server/`, `shared/`)
2. TypeScript configuration for all packages
3. Vite setup for client, tsc for server
4. Basic Express server with Socket.io
5. Basic React app with Socket.io client
6. Shared types foundation
7. Development scripts (dev, build)

**What NOT to Implement**:
- Game logic
- Room creation
- Seating system
- Betting mechanics
- UI components beyond basic landing page

**Success Criteria**:
- Client connects to server via Socket.io
- Server logs client connections
- Hot reload works for both client and server

**Estimated Time**: 2-3 hours

---

## Phase 1: Room & Seating

**Goals**: Implement room creation, joining, and seating system.

**What to Implement**:
1. Room management (creation, joining, state storage)
2. Seating system (take seat, leave seat, validation)
3. Room lobby UI (table visualization, seat components)
4. Seat modal (username, starting stack)
5. Owner identification and display
6. Room configuration (blinds setting)

**What NOT to Implement**:
- Hand mechanics
- Betting logic
- Pot calculation
- Owner controls (beyond config)
- Dealer button
- Blinds posting

**Success Criteria**:
- User can create room and get shareable link
- Multiple users can take different seats
- Username uniqueness enforced
- Room state syncs to all clients
- Owner can configure blinds

**Estimated Time**: 4-6 hours

---

## Phase 2: Betting Engine

**Goals**: Implement Texas Hold'em betting rules, action validation, and betting round management.

**What to Implement**:
1. Betting rules engine (minimum bet, minimum raise, action legality)
2. Action validation (turn, amount, status checks)
3. Action processing (bet, call, raise, check, fold, all-in)
4. Betting round management (action order, completion detection)
5. Basic hand state (hand creation, preflop only)
6. Owner controls - start hand
7. Client betting UI (action buttons, bet input, turn indicators)

**What NOT to Implement**:
- Hand phases beyond preflop
- Pot calculation (bets tracked but not aggregated)
- Side pots
- Dealer button rotation
- Blinds posting (manual for now)
- Showdown

**Success Criteria**:
- Owner can start a hand
- Players can bet, call, raise, check, fold, all-in
- Betting rules enforced
- Turn order correct
- Betting round completes correctly

**Estimated Time**: 6-8 hours

---

## Phase 3: Pots & Side Pots

**Goals**: Implement pot calculation and side pot creation for all-in scenarios.

**What to Implement**:
1. Pot models (main pot, side pots)
2. Pot calculator (total contributions, all-in thresholds)
3. Side pot creator (excess contributions, eligibility tracking)
4. Pot updates during betting rounds
5. Client pot display (main pot, side pots, eligibility)

**What NOT to Implement**:
- Pot distribution (showdown not yet)
- Winner selection
- Hand phases beyond preflop
- Blinds (still manual)
- Dealer button rotation

**Success Criteria**:
- Main pot calculated correctly
- Side pots created when player goes all-in
- Side pot eligibility tracked correctly
- Multiple side pots supported
- Pot amounts displayed correctly

**Estimated Time**: 4-6 hours

---

## Phase 4: Owner Controls

**Goals**: Complete owner control system, hand lifecycle, dealer button, blinds, and undo.

**What to Implement**:
1. Hand lifecycle (phase transitions: pre-hand → preflop → flop → turn → river → showdown)
2. Dealer button (rotation logic, blind calculation)
3. Blinds system (automatic posting, deduction, all-in handling)
4. Owner action handlers (advance round, assign button, force fold, adjust stack, undo, end hand, reset room, kick player)
5. Event logging (for undo functionality)
6. Undo system (restore state from event snapshot)
7. Owner controls UI panel
8. Hand phase display and transitions

**What NOT to Implement**:
- Winner selection UI (showdown phase only)
- Pot distribution (manual for now)
- Hand history export
- Statistics

**Success Criteria**:
- Owner can start hand (blinds auto-posted)
- Owner can advance through all betting rounds
- Dealer button rotates correctly
- Blinds post automatically
- Owner can use all control functions
- Undo restores previous state correctly
- Hand progresses through all phases

**Estimated Time**: 8-10 hours

---

## Phase 5: Showdown & Polish

**Goals**: Complete hand lifecycle, winner selection, pot distribution, disconnection handling, and UX polish.

**What to Implement**:
1. Showdown system (pot distribution logic, winner validation)
2. Owner winner selection (UI modal, pot assignment, split pots)
3. Disconnection handling (preserve state, reconnection logic)
4. Error handling (comprehensive messages, validation feedback)
5. Edge cases (all players all-in, everyone folds, blind > stack, etc.)
6. UX polish (loading states, visual feedback, responsive design)
7. State validation (invariant checking, consistency validation)
8. Room cleanup (garbage collection, timeout handling)

**What NOT to Implement**:
- Hand history export
- Statistics dashboard
- Blind timers
- Buy-ins mid-game
- Multi-table rooms
- Persistent storage
- Spectators

**Success Criteria**:
- Complete hand can be played from start to finish
- Owner can select winners and distribute pots
- Players can disconnect and reconnect without losing state
- All edge cases handled gracefully
- UI is polished and responsive
- Error messages are clear and helpful
- Game is playable end-to-end

**Estimated Time**: 6-8 hours

---

## Phase 6: Testing & Hardening (Optional, Post-v1)

**Goals**: Comprehensive testing, performance optimization, security review, production readiness.

**What to Implement**:
1. Unit tests (betting engine, pot calculation, validation)
2. Integration tests (full hand flow, multi-player scenarios)
3. E2E tests (Playwright for critical flows)
4. Performance optimization (state updates, broadcasts, memory leaks)
5. Security (input sanitization, rate limiting, XSS prevention)
6. Documentation (API docs, deployment guide, dev setup)

**Estimated Time**: 8-12 hours (optional)

---

## Development Timeline Summary

| Phase | Focus | Estimated Time | Cumulative |
|-------|-------|---------------|------------|
| Phase 0 | Infrastructure | 2-3 hours | 2-3 hours |
| Phase 1 | Room & Seating | 4-6 hours | 6-9 hours |
| Phase 2 | Betting Engine | 6-8 hours | 12-17 hours |
| Phase 3 | Pots & Side Pots | 4-6 hours | 16-23 hours |
| Phase 4 | Owner Controls | 8-10 hours | 24-33 hours |
| Phase 5 | Showdown & Polish | 6-8 hours | 30-41 hours |
| Phase 6 | Testing (Optional) | 8-12 hours | 38-53 hours |

**Total Estimated Time (v1)**: 30-41 hours  
**Total Estimated Time (with testing)**: 38-53 hours

---

## Development Principles

1. **Incremental Development**: Each phase builds on previous, testable milestones
2. **Server Authority**: All game logic on server; client renders state
3. **Type Safety**: TypeScript + Zod for compile-time and runtime validation
4. **State Invariants**: Enforce domain model invariants at each step
5. **Real-Time First**: Socket.io events designed before implementation
6. **Mobile-Ready**: Responsive design from the start
7. **Error Handling**: Clear errors at each phase
8. **No Premature Optimization**: Focus on correctness first, optimize later

---

## Risk Areas & Mitigation

### High-Risk Areas

1. **Betting Rules Complexity**
   - **Risk**: Complex edge cases in Texas Hold'em rules
   - **Mitigation**: Start with simple cases, add edge cases incrementally. Extensive validation.

2. **Side Pot Logic**
   - **Risk**: Complex calculations with multiple all-in scenarios
   - **Mitigation**: Test thoroughly with multiple all-in scenarios. Create test cases early.

3. **State Synchronization**
   - **Risk**: Clients showing inconsistent state
   - **Mitigation**: Use full state snapshots initially. Event logging for debugging.

4. **Disconnection Handling**
   - **Risk**: Players losing state on disconnect
   - **Mitigation**: Implement early, test frequently. Preserve state for players with chips in play.

---

**This document provides the execution roadmap. Follow phases sequentially, ensuring each phase meets success criteria before proceeding.**

