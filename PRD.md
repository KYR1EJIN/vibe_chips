# Product Requirements Document (PRD)
## Chip-Only Texas Hold’em Poker Web App

---

## 1. Product Overview

### 1.1 Product Name (Working)
ChipTable (working title)

### 1.2 Product Summary
ChipTable is a real-time, chip-only Texas Hold’em poker simulator designed for in-person poker games where physical cards are available but poker chips are not. The app replaces chips, dealer duties, and accounting while preserving authentic Texas Hold’em betting rules.

The app does **not** deal cards, evaluate hands, or determine winners automatically. Instead, it provides a synchronized digital chip table where players manage stacks, bets, pots, blinds, and side pots, with the room owner acting as the dealer/referee.

---

## 2. Goals & Non-Goals

### 2.1 Goals
- Allow users to create a poker room instantly with a shareable link
- Support up to 10 players seated at a virtual table
- Accurately simulate Texas Hold’em betting mechanics using chips only
- Maintain a real-time, authoritative game state across all players
- Eliminate disputes over bets, stacks, and pots
- Require zero account registration

### 2.2 Non-Goals
- No card dealing or hand evaluation
- No AI dealer or winner determination
- No gambling, payments, or real-money handling
- No long-term persistence (rooms are temporary)
- No advanced analytics or player statistics (v1)

---

## 3. Target Users

### 3.1 Primary Users
- Friends playing casual in-person Texas Hold’em
- Home games without physical poker chips

### 3.2 User Roles
- **Room Owner (Host)**: Creates the room and controls the game flow
- **Player**: Joins via link, takes a seat, and participates in betting
- **Spectator (optional, future)**: Views the table without interaction

---

## 4. User Journey

### 4.1 Landing Page
- Primary CTA: “Start a New Game”
- Optional CTA: “Join a Game” (via link)

### 4.2 Room Creation
- Clicking “Start a New Game”:
  - Generates a unique room ID
  - Generates a shareable URL
  - Assigns the creator as Room Owner
  - Redirects to the Room Lobby

### 4.3 Room Lobby
- Displays:
  - Virtual poker table with 10 empty seats
  - “Waiting for players” state
  - Shareable room link
- Owner can configure:
  - Blinds (SB / BB)
  - Max seats (default 10)

### 4.4 Seating Flow
- Clicking an empty seat opens a modal:
  - Username (required, unique per room)
  - Starting stack (required, numeric > 0)
  - Optional “Sit Out” toggle
- Once confirmed:
  - Seat is locked
  - Player stack initialized
  - Player is added to the table state

---

## 5. Table & Seat Model

### 5.1 Table
- Fixed maximum of 10 seats
- Seats numbered 1–10
- Visual indicators:
  - Dealer button
  - Active player
  - Folded / All-in states

### 5.2 Seat State
Each seat stores:
- Seat number
- Occupied (true/false)
- Player ID
- Username
- Current stack
- Current bet (this round)
- Status (active / folded / all-in / sitting out)

---

## 6. Game Lifecycle

### 6.1 Hand Phases
Each hand progresses through the following phases:
1. Pre-Hand Setup
2. Preflop Betting
3. Flop Betting
4. Turn Betting
5. River Betting
6. Showdown / Payout
7. Hand Reset

---

### 6.2 Pre-Hand Setup
- Dealer button assigned (rotates each hand)
- Small Blind (SB) posted by player left of dealer
- Big Blind (BB) posted by player left of SB
- Blinds automatically deducted from stacks
- If stack < blind → player goes all-in

---

## 7. Betting Rules (Texas Hold’em – Chip Only)

### 7.1 Action Order
- Preflop: Action starts left of BB
- Postflop: Action starts left of dealer
- Skips folded or all-in players

### 7.2 Allowed Actions
- Fold
- Check (if no bet to call)
- Call
- Bet
- Raise
- All-in

### 7.3 Betting Constraints
- Minimum bet = Big Blind
- Minimum raise = size of last raise
- All-in below minimum raise does NOT reopen action
- Betting round ends when all active players have:
  - Called the highest bet, or
  - Folded, or
  - Are all-in

---

## 8. Pot & Side Pot Management

### 8.1 Pot Structure
- One Main Pot
- Zero or more Side Pots

Each pot stores:
- Pot amount
- Eligible players

### 8.2 Side Pot Creation
- When a player goes all-in:
  - Contributions are split at the all-in level
  - Side pots created for excess bets
  - Eligibility tracked per pot

### 8.3 Example
Players:
- A: 100
- B: 50 (all-in)
- C: 200

If all call:
- Main Pot: 150 (A, B, C eligible)
- Side Pot: 100 (A, C eligible)

---

## 9. Showdown & Payout

### 9.1 Winner Selection
- Room Owner manually selects:
  - One or multiple winners per pot
- App does not evaluate cards

### 9.2 Pot Distribution
- Main pot distributed to eligible winners
- Side pots resolved independently
- Split pots supported
- Remainders handled by:
  - Smallest unit
  - Or owner manual adjustment

---

## 10. Room Owner Controls

Owner-only actions:
- Start hand
- Advance betting round
- Assign / move dealer button
- Force fold player
- Adjust player stacks
- Undo last action (recommended)
- End hand
- Reset room
- Kick player

---

## 11. Real-Time & State Management

### 11.1 State Authority
- Server is the single source of truth
- Clients render based on server state

### 11.2 State Categories
- Room state
- Player list
- Seat assignments
- Hand state
- Betting round
- Pots and side pots
- Action history

### 11.3 Synchronization
- All player actions validated server-side
- Clients receive real-time updates
- Reconnect restores seat and stack

---

## 12. Edge Cases & Failure Handling

Must handle:
- Player disconnects mid-hand
- Owner disconnects
- Player leaves with chips in play
- All players all-in early
- Everyone folds except one
- Blind larger than stack
- Simultaneous seat selection
- Duplicate usernames

---

## 13. UX & Design Principles

- Minimalist, poker-table aesthetic
- Clear indication of:
  - Active player
  - Current bet
  - Amount to call
  - Stack size
  - Pots
- One primary action button per turn
- High contrast for critical states (All-in, Folded)

---

## 14. Platform & Deployment

### 14.1 Web (v1)
- Desktop and mobile responsive
- Link-based access
- No authentication required

### 14.2 Mobile App (v2)
- App Store deployment
- Deep linking into rooms
- Background reconnect support

---

## 15. Future Enhancements (Out of Scope for v1)

- Hand history export
- Blind timers
- Buy-ins mid-game
- Statistics dashboard
- Multi-table rooms
- Persistent user profiles

---

## 16. Success Metrics

- Time to create a room < 10 seconds
- Zero betting/pot disputes during play
- Stable real-time sync with 10 players
- Successful full-game completion without reset

---

## 17. Open Questions

- Should spectators be allowed in v1?
- Should buy-ins be locked after hand start?
- How strict should undo permissions be?

---

End of PRD.
