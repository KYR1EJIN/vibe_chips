# Phase 2 Assessment & Bug Fixes

## Current Stage: Phase 2 (Betting Engine) - **INCOMPLETE**

### ✅ Completed Features

1. **Room & Seating (Phase 1)** ✅
   - Room creation and joining
   - Seating system with validation
   - Username uniqueness enforcement
   - Room configuration (blinds)
   - Owner identification

2. **Betting Engine (Phase 2) - Partial** ✅
   - Betting rules engine (minimum bet, minimum raise)
   - Action validation (turn, amount, status checks)
   - Action processing (bet, call, raise, check, fold, all-in)
   - Betting round state management
   - Turn order management
   - Hand creation (owner_start_hand)
   - Client betting UI

### ❌ Critical Bug Found

**BUG: Blinds Not Posted When Hand Starts**

**Location**: `server/src/socket/ownerHandlers.ts` - `owner_start_hand` handler

**Problem**:
- When owner starts a hand, the betting round is initialized with `highestBet = bigBlind`
- However, the small blind and big blind players' `currentBet` remains 0
- Their stacks are NOT deducted for the blinds
- The betting round completion check will fail because it checks if all active players have `currentBet === highestBet`, but blinds haven't been set

**Impact**:
- Betting round completion detection is broken
- Players can't properly call/raise because the blinds aren't actually posted
- Pot calculation (Phase 3) will be incorrect because chips aren't deducted

**Root Cause**:
- Line 258 comment says "no automatic blinds posting yet" but the betting logic requires blinds to be posted
- Lines 283-287 reset players to active and reset currentBet, but don't post blinds

**Fix Required**:
Post blinds when hand starts:
1. Deduct small blind from small blind player's stack
2. Set small blind player's `currentBet = smallBlind`
3. Deduct big blind from big blind player's stack
4. Set big blind player's `currentBet = bigBlind`
5. Handle all-in case if stack < blind amount

---

## Test Plan Before Moving to Phase 3

### Test Category 1: Room & Seating (Phase 1 Validation)

#### Test 1.1: Room Creation
- [ ] Create a new room
- [ ] Verify room ID is generated
- [ ] Verify owner is set correctly
- [ ] Verify default blinds (5/10) are set
- [ ] Verify shareable link works

#### Test 1.2: Multiple Players Join
- [ ] Player 1 creates room
- [ ] Player 2 joins room via link
- [ ] Player 3 joins room via link
- [ ] All players see same room state
- [ ] Room state syncs in real-time

#### Test 1.3: Seating System
- [ ] Player 1 takes seat 1 with username "Alice", stack 1000
- [ ] Player 2 takes seat 3 with username "Bob", stack 2000
- [ ] Player 3 tries to take seat 1 → Should fail (occupied)
- [ ] Player 3 tries to use username "Alice" → Should fail (duplicate)
- [ ] Player 3 takes seat 5 with username "Charlie", stack 1500
- [ ] All players see updated seat assignments

#### Test 1.4: Leave Seat
- [ ] Player 2 leaves seat
- [ ] Seat 3 becomes empty
- [ ] Player 2 removed from room
- [ ] Other players see updated state

#### Test 1.5: Room Configuration
- [ ] Owner updates small blind to 10
- [ ] Big blind automatically updates to 20
- [ ] All players see updated config

---

### Test Category 2: Hand Start & Blinds (Phase 2 - Critical)

#### Test 2.1: Start Hand with 2 Players
- [ ] 2 players seated
- [ ] Owner starts hand
- [ ] **VERIFY**: Small blind player's stack reduced by small blind
- [ ] **VERIFY**: Small blind player's `currentBet = smallBlind`
- [ ] **VERIFY**: Big blind player's stack reduced by big blind
- [ ] **VERIFY**: Big blind player's `currentBet = bigBlind`
- [ ] **VERIFY**: First action seat is left of big blind
- [ ] **VERIFY**: `highestBet = bigBlind` in betting round
- [ ] All players see hand started

#### Test 2.2: Start Hand with 3+ Players
- [ ] 3+ players seated
- [ ] Owner starts hand
- [ ] Verify blinds posted correctly
- [ ] Verify dealer button, small blind, big blind positions correct
- [ ] Verify first action seat is left of big blind

#### Test 2.3: Blind All-In Scenario
- [ ] Player with stack = 3 (small blind = 5)
- [ ] Player is assigned small blind seat
- [ ] Owner starts hand
- [ ] **VERIFY**: Player goes all-in for 3 chips
- [ ] **VERIFY**: Player's `currentBet = 3`
- [ ] **VERIFY**: Player's `status = 'all-in'`
- [ ] **VERIFY**: Big blind still posts full big blind

#### Test 2.4: Cannot Start Hand with < 2 Players
- [ ] Only 1 player seated
- [ ] Owner tries to start hand
- [ ] Should fail with "INSUFFICIENT_PLAYERS" error

#### Test 2.5: Cannot Start Hand if Hand Already Active
- [ ] Hand is active
- [ ] Owner tries to start another hand
- [ ] Should fail with "HAND_ALREADY_ACTIVE" error

---

### Test Category 3: Betting Actions (Phase 2)

#### Test 3.1: Check (No Bet to Call)
- [ ] Hand started, all players called/folded except one
- [ ] Last active player can check
- [ ] Action succeeds
- [ ] Turn order updates correctly

#### Test 3.2: Call
- [ ] Player 1 bets 50
- [ ] Player 2 can call 50
- [ ] **VERIFY**: Player 2's stack reduced by 50
- [ ] **VERIFY**: Player 2's `currentBet = 50`
- [ ] Turn order updates correctly

#### Test 3.3: Bet
- [ ] No bet to call (all checked or new round)
- [ ] Player can bet minimum (big blind)
- [ ] **VERIFY**: Stack reduced correctly
- [ ] **VERIFY**: `currentBet` set correctly
- [ ] **VERIFY**: `highestBet` updated
- [ ] Turn order updates correctly

#### Test 3.4: Raise
- [ ] Player 1 bets 50
- [ ] Player 2 raises to 150 (minimum raise = 50, so 50 + 50 = 100 minimum)
- [ ] **VERIFY**: Player 2's stack reduced by 150
- [ ] **VERIFY**: Player 2's `currentBet = 150`
- [ ] **VERIFY**: `highestBet = 150`
- [ ] **VERIFY**: `minimumRaise = 100` (size of raise)
- [ ] Turn order updates correctly

#### Test 3.5: Fold
- [ ] Player folds
- [ ] **VERIFY**: Player's `status = 'folded'`
- [ ] **VERIFY**: Player skipped in turn order
- [ ] Turn order updates correctly

#### Test 3.6: All-In
- [ ] Player has stack = 75
- [ ] Highest bet = 100
- [ ] Player goes all-in
- [ ] **VERIFY**: Player's stack = 0
- [ ] **VERIFY**: Player's `currentBet = 75` (previousBet + all-in amount)
- [ ] **VERIFY**: Player's `status = 'all-in'`
- [ ] **VERIFY**: `highestBet` updated if all-in > current highest
- [ ] Turn order updates correctly

#### Test 3.7: Invalid Actions
- [ ] Not player's turn → Action fails
- [ ] Bet below minimum → Action fails
- [ ] Raise below minimum → Action fails
- [ ] Call with insufficient stack → Action fails (should go all-in instead)
- [ ] Check when bet to call → Action fails
- [ ] Bet when bet to call → Action fails (should raise instead)

---

### Test Category 4: Betting Round Completion (Phase 2 - Critical)

#### Test 4.1: All Players Call
- [ ] Hand started, blinds posted
- [ ] All active players call the big blind
- [ ] **VERIFY**: Betting round completes
- [ ] **VERIFY**: `isComplete = true`
- [ ] **VERIFY**: `actionSeat = null`

#### Test 4.2: All But One Fold
- [ ] 3 players in hand
- [ ] 2 players fold
- [ ] **VERIFY**: Betting round completes
- [ ] **VERIFY**: Last player wins (no showdown yet, but round ends)

#### Test 4.3: All Players All-In
- [ ] Multiple players go all-in
- [ ] **VERIFY**: Betting round completes when all active players are all-in

#### Test 4.4: Turn Order Wraps Around
- [ ] 3 players: seats 1, 5, 10
- [ ] Action starts at seat 2 (left of big blind)
- [ ] **VERIFY**: Turn order wraps: 2 → 5 → 10 → 1 → 2 (skips empty seats)

#### Test 4.5: Skips Folded/All-In Players
- [ ] Player at seat 3 is folded
- [ ] Player at seat 4 is all-in
- [ ] Action at seat 2
- [ ] **VERIFY**: Next action is seat 5 (skips 3 and 4)

---

### Test Category 5: Edge Cases

#### Test 5.1: Player Disconnects Mid-Hand
- [ ] Hand active, player disconnects
- [ ] **VERIFY**: Player state preserved
- [ ] **VERIFY**: Other players see disconnect status
- [ ] Player can reconnect and continue

#### Test 5.2: Multiple Actions Rapidly
- [ ] Multiple players act quickly
- [ ] **VERIFY**: Actions processed in order
- [ ] **VERIFY**: No race conditions
- [ ] **VERIFY**: State remains consistent

#### Test 5.3: Owner Disconnects
- [ ] Owner disconnects
- [ ] **VERIFY**: Room still functional
- [ ] **VERIFY**: Other players can continue

---

## Priority Fixes Before Phase 3

### 🔴 CRITICAL (Must Fix)

1. **Post Blinds When Hand Starts**
   - File: `server/src/socket/ownerHandlers.ts`
   - Function: `owner_start_hand` handler
   - Fix: Add blind posting logic before setting players to active

### 🟡 HIGH (Should Fix)

2. **Betting Round Completion Detection**
   - Verify completion logic works after blinds are posted
   - Test edge cases (all-in scenarios, wrapped turn order)

### 🟢 MEDIUM (Nice to Have)

3. **Error Messages**
   - Improve error messages for invalid actions
   - Add client-side validation feedback

---

## Next Steps

1. **Fix Critical Bug**: Implement blind posting in `owner_start_hand`
2. **Run Test Suite**: Execute all tests in Test Category 2 (Hand Start & Blinds)
3. **Run Test Suite**: Execute all tests in Test Category 4 (Betting Round Completion)
4. **Fix Any Issues Found**: Address bugs discovered during testing
5. **Documentation**: Update code comments if needed
6. **Move to Phase 3**: Only after all Phase 2 tests pass

---

## Success Criteria for Phase 2 Completion

- [x] Owner can start a hand
- [ ] **Blinds are posted correctly** (BUG - needs fix)
- [ ] Players can bet, call, raise, check, fold, all-in
- [ ] Betting rules enforced
- [ ] Turn order correct
- [ ] **Betting round completes correctly** (depends on blind fix)

---

**Status**: Phase 2 is **90% complete** but has a **critical bug** that must be fixed before proceeding to Phase 3 (Pots & Side Pots).

