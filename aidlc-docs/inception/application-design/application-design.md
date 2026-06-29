# Application Design — Phase 10 Web Application (Consolidated)

## Architecture Summary

**Pattern**: Mediator/Controller with feature-based modules  
**UI**: Web Components (Custom Elements + Shadow DOM)  
**State**: Hybrid — centralized game state + local UI state per component  
**Communication**: All inter-component communication flows through the Game Controller  

---

## Component Map

| # | Component | Directory | Purpose |
|---|-----------|-----------|---------|
| 1 | Game Engine | `src/game-engine/` | Core rules, state, validation, scoring |
| 2 | Networking | `src/networking/` | WebRTC P2P connectivity |
| 3 | AI | `src/ai/` | AI opponents (easy/hard strategies) |
| 4 | UI | `src/ui/` | Web Components for rendering and interaction |
| 5 | Storage | `src/storage/` | localStorage/IndexedDB persistence |
| 6 | Controller | `src/controller/` | Central mediator/orchestrator |

## Key Design Decisions

1. **Game Engine is pure logic** — no DOM access, no I/O, fully testable in isolation
2. **Controller is the only "aware" module** — it knows about all other components; they don't know about each other (except AI reads Game Engine evaluators)
3. **Web Components encapsulate UI** — Shadow DOM provides style isolation, each component manages its own rendering
4. **State flows one direction** — Controller pushes state into UI; UI emits user actions back to Controller via callbacks
5. **Networking is host-authoritative** — host's Game Engine is the source of truth; guest sends actions, receives validated state

## Data Types (Shared)

```javascript
// Card
{ id, number (1-12|'wild'|'skip'), color ('red'|'blue'|'green'|'yellow'|null) }

// GameState
{ players[], deck[], discardPile[], currentPlayerIndex, round, turnPhase, laidDownPhases{}, scores{} }

// Player
{ id, name, hand[], currentPhase, isAI, difficulty? }

// PlayerAction
{ type ('draw'|'discard'|'laydown'|'hit'|'skip'), payload }

// GameConfig
{ mode ('ai'|'online'), difficulty?, playerNames[], phaseList? }
```

## File Structure
```
src/
├── main.js                    (entry point)
├── types.js                   (shared type definitions/JSDoc)
├── controller/
│   ├── game-controller.js
│   ├── turn-manager.js
│   └── session-manager.js
├── game-engine/
│   ├── deck.js
│   ├── phase-validator.js
│   ├── game-state.js
│   ├── scoring.js
│   └── rules.js
├── ai/
│   ├── ai-player.js
│   ├── strategy-easy.js
│   ├── strategy-hard.js
│   └── card-evaluator.js
├── networking/
│   ├── peer-connection.js
│   ├── signaling.js
│   ├── data-channel.js
│   └── sync.js
├── ui/
│   ├── game-board.js
│   ├── player-hand.js
│   ├── card-element.js
│   ├── phase-display.js
│   ├── score-board.js
│   ├── game-menu.js
│   ├── rules-panel.js
│   ├── game-log.js
│   └── phase-editor.js
├── storage/
│   ├── game-store.js
│   ├── history-store.js
│   ├── phase-list-store.js
│   └── settings-store.js
├── styles/
│   ├── main.css
│   └── animations.css
└── index.html
```

## Interaction Summary

- **User plays a card** → UI emits action → Controller validates via Engine → Controller updates UI + saves state
- **AI takes turn** → Controller triggers AI → AI returns actions → Controller processes through Engine → UI animates
- **Online opponent acts** → Guest sends action via DataChannel → Host validates via Engine → Host broadcasts new state → Both UIs update
- **Undo** → Controller restores previous snapshot → UI re-renders from restored state
