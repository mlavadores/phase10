# Unit of Work Dependencies — Phase 10 Web Application

## Dependency Matrix

| Unit | Depends On | Depended On By |
|------|-----------|----------------|
| Unit 1: Core Foundation | (none) | Unit 2, Unit 3 |
| Unit 2: Features | Unit 1 (types, evaluators) | Unit 3 |
| Unit 3: Integration | Unit 1, Unit 2 | (none — final assembly) |

## Build Sequence

```
Unit 1: Core Foundation  ──►  Unit 2: Features  ──►  Unit 3: Integration
     (no deps)              (needs Core types)      (needs everything)
```

**Sequence is strictly linear** — each unit depends on the previous one being complete.

## Dependency Details

### Unit 2 → Unit 1 Dependencies
| Unit 2 Module | Depends On (from Unit 1) | Dependency Type |
|---------------|--------------------------|-----------------|
| ai/card-evaluator.js | game-engine/phase-validator.js | Read-only import (validation logic) |
| ai/strategy-*.js | types.js (Card, GameState) | Type references |
| networking/sync.js | types.js (GameState, PlayerAction) | Serialization types |
| ui/card-element.js | types.js (Card) | Type references for rendering |
| ui/player-hand.js | types.js (Card[]) | Type references |
| ui/phase-display.js | types.js (PhaseDefinition) | Phase info display |

### Unit 3 → Unit 1 Dependencies
| Unit 3 Module | Depends On (from Unit 1) | Dependency Type |
|---------------|--------------------------|-----------------|
| controller/game-controller.js | game-engine/* (all modules) | Direct orchestration |
| controller/game-controller.js | storage/* (all modules) | Save/load calls |
| controller/turn-manager.js | game-engine/rules.js, game-state.js | Turn validation |

### Unit 3 → Unit 2 Dependencies
| Unit 3 Module | Depends On (from Unit 2) | Dependency Type |
|---------------|--------------------------|-----------------|
| controller/game-controller.js | ai/ai-player.js | Trigger AI turns |
| controller/game-controller.js | ui/game-board.js | Push state to UI |
| controller/session-manager.js | networking/peer-connection.js | Manage P2P sessions |
| controller/session-manager.js | networking/sync.js | State broadcast |
| main.js | ui/* (Web Component registration) | Component initialization |

## Construction Phase Execution

Since Functional Design is combined (one pass), the Construction phase flows as:

```
Combined Functional Design (all units)
           │
           ▼
Code Generation: Unit 1 (Core Foundation)
           │
           ▼
Code Generation: Unit 2 (Features)
           │
           ▼
Code Generation: Unit 3 (Integration)
           │
           ▼
Build and Test (entire application)
```

## Risk Notes
- **Unit 1** is zero-risk (no external dependencies, pure logic)
- **Unit 2** has moderate risk in Networking (WebRTC browser API complexity)
- **Unit 3** has integration risk (wiring all parts together, handling edge cases in orchestration)
