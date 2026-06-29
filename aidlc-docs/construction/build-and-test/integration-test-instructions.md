# Integration Test Instructions — Phase 10 Web Application

## Purpose
Test interactions between components to ensure the mediator pattern correctly orchestrates game flow.

---

## Test Environment Setup
```bash
# Start local server
npm run dev
# Open browser at http://localhost:3000
```

---

## Integration Test Scenarios

### Scenario 1: Complete AI Game Turn (Controller ↔ Engine ↔ AI ↔ UI)

**Description**: Verify a full turn cycle works end-to-end: player draws, lays down, discards, then AI takes its turn.

**Test Steps**:
1. Start a new AI game (Easy difficulty)
2. Click the Draw Pile to draw a card
3. Verify: hand now has 11 cards, turn indicator shows "ACTION"
4. Select cards and click "Lay Down Phase" (or skip if cards don't match)
5. Click a card to discard it
6. Verify: hand has 10 cards, turn indicator switches to AI
7. Wait for AI to complete its turn (1-6 seconds)
8. Verify: turn indicator switches back to player, AI's card count may have changed

**Expected Results**:
- No console errors throughout
- UI updates smoothly with animations
- Game state persists to localStorage after each turn
- Game log shows actions for both players

---

### Scenario 2: Phase Validation Integration (UI → Controller → Engine)

**Description**: Verify that the phase lay-down flow correctly validates through all layers.

**Test Steps**:
1. Start AI game, play until you have cards matching Phase 1 (2 sets of 3)
2. Select 6 appropriate cards from hand
3. Click "Lay Down Phase"
4. Verify: cards move to table area, phase display advances

**Expected Results**:
- Valid phase accepted and displayed on table
- Invalid phase shows error toast message
- Player's phase number advances in phase-display
- After laying down, hitting is enabled

---

### Scenario 3: Undo Integration (Controller → Engine → UI)

**Description**: Verify undo restores previous state correctly.

**Test Steps**:
1. Start AI game
2. Draw a card from the pile
3. Note the hand state (11 cards)
4. Click "Undo"
5. Verify: hand returns to 10 cards, turn phase returns to "DRAW"

**Expected Results**:
- State fully restored (hand, piles, turn phase)
- UI reflects restored state
- Undo button disables after use (single undo)

---

### Scenario 4: Round End Integration (Controller → Scoring → State → UI)

**Description**: Verify round-end scoring, phase advancement, and new deal.

**Test Steps**:
1. Play an AI game until one player goes out (discards last card)
2. Observe round-end behavior

**Expected Results**:
- Score summary appears with penalty breakdown
- Players who completed their phase advance to next phase
- New round deals 10 cards to each player
- Game continues until someone completes all phases

---

### Scenario 5: Game Persistence Integration (Controller → Storage → UI)

**Description**: Verify save/resume works across browser sessions.

**Test Steps**:
1. Start an AI game and play several turns
2. Close the browser tab
3. Reopen the application
4. Click "Resume Game"

**Expected Results**:
- Game resumes from exact state (same hand, same scores, same phase)
- Turn continues where it left off
- No data loss

---

### Scenario 6: Online Multiplayer Integration (Controller → Networking → PeerJS)

**Description**: Verify two-player WebRTC connection and state sync.

**Test Steps**:
1. Open application in Browser Tab A
2. Click "Host Online Game", enter name, click "Create Room"
3. Copy the room code displayed
4. Open application in Browser Tab B
5. Click "Join Online Game", enter name, paste room code, click "Join"
6. Verify both tabs show the game screen

**Expected Results**:
- Connection establishes within 5 seconds
- Host sees game start after guest joins
- Guest receives initial game state
- Both players see the same game board
- Actions by one player are reflected in the other's UI

**Note**: This test requires internet access for PeerJS signaling server.

---

## Running Integration Tests

These are manual tests run in a browser. For automation, a tool like Playwright could be used:

```bash
# Optional: Install Playwright for automation
npm install --save-dev @playwright/test

# Example test script structure
# tests/integration/game-flow.spec.js
```

---

## Troubleshooting

### UI Not Updating After Action
- Check browser console for errors
- Verify `updateState()` is being called on game-board
- Check that Web Components are properly registered (no "undefined element" errors)

### AI Turn Never Completes
- Check console for errors in ai-player.js
- Verify `takeTurn()` promise resolves
- Check for infinite loops in strategy logic

### Online Connection Fails
- Verify internet access (PeerJS needs CDN)
- Check that both tabs use the same room code
- Look for WebRTC errors in console
