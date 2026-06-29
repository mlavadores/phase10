# Code Generation Plan — Unit 2: Features

## Unit Context
- **Unit**: Features (AI + Networking + UI Components)
- **Dependencies**: Unit 1 (types, game-engine utilities)
- **Stories**: US-2.1-2.3 (multiplayer), US-3.1-3.2 (AI), US-5.1-5.4 (UI/UX), US-6.1 (phase editor UI)
- **Output Location**: `src/ai/`, `src/networking/`, `src/ui/` at workspace root

---

## Code Generation Steps

- [x] Step 1: AI card evaluator — Create `src/ai/card-evaluator.js` with evaluateCardUtility, groupByPhaseProgress
- [x] Step 2: AI easy strategy — Create `src/ai/strategy-easy.js` with chooseDrawSource, chooseDiscard, attemptLayDown, attemptHits
- [x] Step 3: AI hard strategy — Create `src/ai/strategy-hard.js` with strategic decision-making
- [x] Step 4: AI player orchestrator — Create `src/ai/ai-player.js` with takeTurn (variable delay), difficulty dispatch
- [x] Step 5: Networking peer connection — Create `src/networking/peer-connection.js` with PeerJS wrapper (createHost, joinGame, close)
- [x] Step 6: Networking data channel — Create `src/networking/data-channel.js` with send, onMessage, onStateChange
- [x] Step 7: Networking sync — Create `src/networking/sync.js` with broadcastState, sendAction, handleIncoming
- [x] Step 8: UI card-element — Create `src/ui/card-element.js` Web Component (card rendering, selection, drag)
- [x] Step 9: UI player-hand — Create `src/ui/player-hand.js` Web Component (hand display, card selection, drag initiation)
- [x] Step 10: UI phase-display — Create `src/ui/phase-display.js` Web Component (phase progress tracker)
- [x] Step 11: UI score-board — Create `src/ui/score-board.js` Web Component (scores, round summary)
- [x] Step 12: UI game-log — Create `src/ui/game-log.js` Web Component (action feed)
- [x] Step 13: UI game-menu — Create `src/ui/game-menu.js` Web Component (main menu, setup screens, online join)
- [x] Step 14: UI rules-panel — Create `src/ui/rules-panel.js` Web Component (game rules/tutorial)
- [x] Step 15: UI phase-editor — Create `src/ui/phase-editor.js` Web Component (custom phase list editor)
- [x] Step 16: UI game-board — Create `src/ui/game-board.js` Web Component (root container, layout, screen routing)

---

## Story Traceability
| Step | Stories Implemented |
|------|-------------------|
| Steps 1-4 | US-3.1 (Easy AI), US-3.2 (Hard AI) |
| Steps 5-7 | US-2.1 (Host), US-2.2 (Join), US-2.3 (Disconnection) |
| Steps 8-9 | US-5.1 (Responsive), US-5.2 (Animations), US-5.4 (Accessibility) |
| Steps 10-12 | US-5.1 (Responsive UI) |
| Step 13 | US-5.3 (Rules/Help) |
| Step 14 | US-5.3 (Learn Rules) |
| Step 15 | US-6.1 (Custom Phase Editor UI) |
| Step 16 | US-5.1 (Responsive Layout) |
