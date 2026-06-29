# Units of Work — Phase 10 Web Application

## Decomposition Strategy
**Approach**: Dependency-layered (3 units)  
**Deployment**: Single static bundle (monolith)  
**Functional Design**: Combined (one design pass, then code each unit sequentially)

---

## Unit 1: Core Foundation

**Scope**: Game Engine + Storage  
**Build Order**: First (no dependencies on other units)

**Components Included**:
- `src/game-engine/` — deck.js, phase-validator.js, game-state.js, scoring.js, rules.js
- `src/storage/` — game-store.js, history-store.js, phase-list-store.js, settings-store.js
- `src/types.js` — Shared type definitions (Card, GameState, Player, etc.)

**Responsibilities**:
- All game logic: deck management, phase validation, scoring, rule enforcement
- State creation, snapshots (undo), and transitions
- Persistence layer: save/load game, history, custom phases, settings
- Shared data types used across all units

**Why grouped together**: Both are dependency-free pure logic modules. Storage serializes the types defined alongside Game Engine. They form the testable foundation everything else builds upon.

---

## Unit 2: Features

**Scope**: AI + Networking + UI Components  
**Build Order**: Second (depends on Unit 1 types and Game Engine utilities)

**Components Included**:
- `src/ai/` — ai-player.js, strategy-easy.js, strategy-hard.js, card-evaluator.js
- `src/networking/` — peer-connection.js, signaling.js, data-channel.js, sync.js
- `src/ui/` — game-board.js, player-hand.js, card-element.js, phase-display.js, score-board.js, game-menu.js, rules-panel.js, game-log.js, phase-editor.js
- `src/styles/` — main.css, animations.css

**Responsibilities**:
- AI decision-making using Game Engine evaluators (read-only dependency)
- WebRTC peer-to-peer connection management and state synchronization
- All Web Components for rendering, user interaction, and animations
- CSS styling and animation definitions

**Why grouped together**: All three are "feature" modules that depend on Core Foundation types but don't depend on each other. They can be developed in parallel within this unit and each connects to the Controller independently.

---

## Unit 3: Integration

**Scope**: Controller + Entry Point + HTML Shell  
**Build Order**: Third (depends on Unit 1 and Unit 2)

**Components Included**:
- `src/controller/` — game-controller.js, turn-manager.js, session-manager.js
- `src/main.js` — Application entry point
- `index.html` — HTML shell with Web Component mounting

**Responsibilities**:
- Orchestrate all components via the mediator pattern
- Manage game lifecycle (new game, resume, online session)
- Coordinate turn flow between human, AI, and online players
- Wire up UI event handlers to game actions
- Initialize the application on page load

**Why grouped together**: The Controller is the glue that imports and coordinates everything. It can only be built once all other components exist. The entry point and HTML shell finalize the application.

---

## Code Organization (Greenfield)

```
Phase10/                          (workspace root)
├── index.html                    (HTML shell)
├── src/
│   ├── main.js                   (entry point)
│   ├── types.js                  (shared types/JSDoc)
│   ├── game-engine/
│   │   ├── deck.js
│   │   ├── phase-validator.js
│   │   ├── game-state.js
│   │   ├── scoring.js
│   │   └── rules.js
│   ├── storage/
│   │   ├── game-store.js
│   │   ├── history-store.js
│   │   ├── phase-list-store.js
│   │   └── settings-store.js
│   ├── ai/
│   │   ├── ai-player.js
│   │   ├── strategy-easy.js
│   │   ├── strategy-hard.js
│   │   └── card-evaluator.js
│   ├── networking/
│   │   ├── peer-connection.js
│   │   ├── signaling.js
│   │   ├── data-channel.js
│   │   └── sync.js
│   ├── ui/
│   │   ├── game-board.js
│   │   ├── player-hand.js
│   │   ├── card-element.js
│   │   ├── phase-display.js
│   │   ├── score-board.js
│   │   ├── game-menu.js
│   │   ├── rules-panel.js
│   │   ├── game-log.js
│   │   └── phase-editor.js
│   ├── styles/
│   │   ├── main.css
│   │   └── animations.css
│   └── controller/
│       ├── game-controller.js
│       ├── turn-manager.js
│       └── session-manager.js
└── aidlc-docs/                   (documentation only)
```
