# Component Dependencies — Phase 10 Web Application

## Dependency Matrix

| Component | Depends On | Depended On By |
|-----------|-----------|----------------|
| Game Engine | (none — pure logic) | Controller |
| Networking | (none — standalone I/O) | Controller |
| AI | Game Engine (reads state, uses evaluator) | Controller |
| UI | (none — receives state via methods) | Controller |
| Storage | (none — standalone I/O) | Controller |
| Controller | Game Engine, Networking, AI, UI, Storage | (entry point) |

## Dependency Diagram

```
+--------------------------------------------------+
|                  Game Controller                   |
|              (Central Mediator)                    |
+--------------------------------------------------+
     |          |          |         |         |
     v          v          v         v         v
+---------+ +-------+ +--------+ +-----+ +---------+
|  Game   | |  Net  | |   AI   | | UI  | | Storage |
| Engine  | | work  | |        | |     | |         |
+---------+ +-------+ +--------+ +-----+ +---------+
                          |
                          v
                    +---------+
                    |  Game   |
                    | Engine  |
                    | (reads) |
                    +---------+
```

## Communication Patterns

### Controller → Components (Commands)
- Controller calls component methods directly (import + invoke)
- Unidirectional: Controller tells components what to do
- Components never call Controller methods

### Components → Controller (Callbacks/Events)
- UI registers event handlers that the Controller provides during initialization
- Networking registers message handlers provided by Controller
- Pattern: Controller passes callback functions into components at setup time

### Data Flow Direction
```
User Input → UI → Controller → Game Engine → Controller → UI (render)
                                    ↓
                              Storage (save)
                                    ↓
                         Networking (broadcast to peer)
```

### AI Data Flow
```
Controller → AI.takeTurn(state) → AI reads GameEngine evaluators → returns actions → Controller
```

## Coupling Analysis

| Relationship | Coupling Level | Reason |
|-------------|---------------|--------|
| Controller → Game Engine | Moderate | Direct method calls, shared state type |
| Controller → UI | Low | Passes state object, receives action callbacks |
| Controller → Networking | Low | Message send/receive, state serialization |
| Controller → AI | Low | Trigger turn, receive action list |
| Controller → Storage | Low | Simple save/load interface |
| AI → Game Engine | Low (read-only) | Uses card-evaluator and phase-validator for analysis |

## Module Import Structure
```
src/
├── controller/
│   ├── game-controller.js   → imports from game-engine/, ui/, ai/, networking/, storage/
│   ├── turn-manager.js      → imports from game-engine/
│   └── session-manager.js   → imports from networking/
├── game-engine/
│   ├── deck.js              → imports game-state.js (types only)
│   ├── phase-validator.js   → no internal imports
│   ├── game-state.js        → no internal imports
│   ├── scoring.js           → no internal imports
│   └── rules.js             → imports phase-validator.js
├── ai/
│   ├── ai-player.js         → imports strategy-easy, strategy-hard, card-evaluator
│   ├── strategy-easy.js     → imports card-evaluator
│   ├── strategy-hard.js     → imports card-evaluator
│   └── card-evaluator.js    → imports from game-engine/phase-validator (read-only)
├── networking/
│   ├── peer-connection.js   → no external imports
│   ├── data-channel.js      → no external imports
│   └── sync.js              → imports data-channel.js
├── ui/
│   ├── game-board.js        → imports child components
│   ├── player-hand.js       → imports card-element
│   ├── card-element.js      → no imports
│   ├── phase-display.js     → no imports
│   ├── score-board.js       → no imports
│   ├── game-menu.js         → no imports
│   ├── rules-panel.js       → no imports
│   ├── game-log.js          → no imports
│   └── phase-editor.js      → no imports
├── storage/
│   ├── game-store.js        → no external imports
│   ├── history-store.js     → no external imports
│   ├── phase-list-store.js  → no external imports
│   └── settings-store.js    → no external imports
└── main.js                  → imports controller/game-controller.js (app entry point)
```
