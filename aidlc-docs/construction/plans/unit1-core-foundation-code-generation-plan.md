# Code Generation Plan — Unit 1: Core Foundation

## Unit Context
- **Unit**: Core Foundation (Game Engine + Storage)
- **Dependencies**: None (first in build order)
- **Stories**: US-1.1 through US-1.6 (core gameplay), US-4.1 (save/resume), US-4.3 (history), US-6.1/US-6.2 (custom phases)
- **Output Location**: `src/` at workspace root (`c:\Users\miguel.lavadores\Phase10\`)

---

## Code Generation Steps

- [x] Step 1: Project structure setup — Create directory structure, index.html, package.json (dev tooling only)
- [x] Step 2: Shared types — Create `src/types.js` with JSDoc type definitions for Card, Player, GameState, PhaseDefinition, PlayerAction, GameConfig, GameResult, PhaseList
- [x] Step 3: Deck module — Create `src/game-engine/deck.js` with createDeck, shuffle, drawFromPile, drawFromDiscard, discard, reshuffleDiscard
- [x] Step 4: Phase validator — Create `src/game-engine/phase-validator.js` with validatePhase, validateSet, validateRun, validateColorGroup, getPhaseDefinition, findValidCombinations, validateHit
- [x] Step 5: Game state — Create `src/game-engine/game-state.js` with createInitialState, getSnapshot, restoreSnapshot, advancePhase, nextTurn, dealRound
- [x] Step 6: Scoring — Create `src/game-engine/scoring.js` with scoreHand, updateScores, getWinner
- [x] Step 7: Rules — Create `src/game-engine/rules.js` with isValidDraw, isValidDiscard, canLayDownPhase, canHit, isRoundOver, isGameOver
- [x] Step 8: Game store — Create `src/storage/game-store.js` with saveGame, loadGame, hasSavedGame, clearSavedGame
- [x] Step 9: History store — Create `src/storage/history-store.js` with addGameResult, getHistory, clearHistory
- [x] Step 10: Phase list store — Create `src/storage/phase-list-store.js` with savePhaseLists, getPhaseLists, deletePhaseList
- [x] Step 11: Settings store — Create `src/storage/settings-store.js` with saveSettings, getSettings
- [x] Step 12: Game engine barrel export — Create `src/game-engine/index.js` re-exporting all engine modules
- [x] Step 13: Storage barrel export — Create `src/storage/index.js` re-exporting all storage modules

---

## Story Traceability
| Step | Stories Implemented |
|------|-------------------|
| Steps 2-7 | US-1.1, US-1.2, US-1.3, US-1.4, US-1.5, US-1.6 |
| Step 8 | US-4.1 (save/resume) |
| Step 9 | US-4.3 (game history) |
| Steps 10-11 | US-6.1, US-6.2 (custom phases storage) |
