# Code Generation Plan — Unit 3: Integration

## Unit Context
- **Unit**: Integration (Controller + Entry Point)
- **Dependencies**: Unit 1 (Game Engine, Storage), Unit 2 (AI, Networking, UI)
- **Stories**: US-1.1 (full turn orchestration), US-4.2 (undo), US-2.1/2.2 (session setup), US-3.1/3.2 (AI triggers)
- **Output Location**: `src/controller/`, `src/main.js`

---

## Code Generation Steps

- [x] Step 1: Turn manager — Create `src/controller/turn-manager.js` (turn flow coordination, action processing)
- [x] Step 2: Session manager — Create `src/controller/session-manager.js` (game mode setup, online sessions)
- [x] Step 3: Game controller — Create `src/controller/game-controller.js` (central mediator, event wiring, game lifecycle)
- [x] Step 4: Update main.js — Wire up entry point with component imports and controller initialization

---

## Story Traceability
| Step | Stories Implemented |
|------|-------------------|
| Step 1 | US-1.1 (turn orchestration), US-4.2 (undo) |
| Step 2 | US-2.1 (host), US-2.2 (join) |
| Step 3 | US-3.1/3.2 (AI triggers), all integration |
| Step 4 | Final wiring |
