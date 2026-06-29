# Components — Phase 10 Web Application

## Component Overview

The application is organized into 6 major components with a Game Controller mediator.

---

## 1. Game Engine (`src/game-engine/`)

**Purpose**: Core game logic, rule enforcement, state management.

**Responsibilities**:
- Manage the canonical game state (deck, hands, phases, scores, turn order)
- Enforce all Phase 10 rules (draw, discard, lay-down, hitting, skip)
- Validate phase attempts against official phase definitions
- Calculate round scoring
- Determine game/round end conditions
- Support undo (state snapshots within a turn)

**Key Sub-modules**:
- `deck.js` — Card creation, shuffling, draw/discard pile management
- `phase-validator.js` — Phase combination validation logic
- `game-state.js` — Centralized state object and state transitions
- `scoring.js` — Score calculation per official rules
- `rules.js` — Turn structure enforcement, win conditions

---

## 2. Networking (`src/networking/`)

**Purpose**: WebRTC peer-to-peer connectivity for online multiplayer.

**Responsibilities**:
- Establish WebRTC data channel connections between two browsers
- Generate and parse connection offers/answers (SDP exchange)
- Serialize and transmit game state changes between peers
- Handle connection lifecycle (connect, disconnect, reconnect)
- Validate incoming game actions on the host side

**Key Sub-modules**:
- `peer-connection.js` — RTCPeerConnection wrapper, ICE handling
- `signaling.js` — Offer/answer generation and exchange mechanism
- `data-channel.js` — Message serialization, send/receive over RTCDataChannel
- `sync.js` — State synchronization protocol (host-authoritative)

---

## 3. AI (`src/ai/`)

**Purpose**: Artificial intelligence opponents with two difficulty levels.

**Responsibilities**:
- Evaluate hand against current phase requirements
- Decide draw source (draw pile vs. discard pile)
- Select optimal discard
- Determine when to lay down phase
- Decide hitting targets
- Implement Easy and Hard strategy variants

**Key Sub-modules**:
- `ai-player.js` — AI turn orchestration with simulated delay
- `strategy-easy.js` — Basic decision-making (random-adjacent choices)
- `strategy-hard.js` — Strategic decision-making (card utility evaluation, opponent awareness)
- `card-evaluator.js` — Card utility scoring relative to current phase

---

## 4. UI (`src/ui/`)

**Purpose**: Web Component-based user interface with responsive design and animations.

**Responsibilities**:
- Render game state as interactive Web Components
- Handle user input (card selection, drag, tap, keyboard)
- Display animations for card movements and phase events
- Manage local UI state (selected cards, menus, modals)
- Provide accessible interaction (ARIA, keyboard nav, focus management)

**Key Sub-modules (Web Components)**:
- `game-board.js` — Main game layout container
- `player-hand.js` — Current player's interactive hand
- `card-element.js` — Individual card rendering
- `phase-display.js` — Phase progress tracker
- `score-board.js` — Score display
- `game-menu.js` — Menu, settings, game setup screens
- `rules-panel.js` — Rules/help/tutorial content
- `game-log.js` — Action log display
- `phase-editor.js` — Custom phase list editor

---

## 5. Storage (`src/storage/`)

**Purpose**: Browser-based persistence using localStorage/IndexedDB.

**Responsibilities**:
- Save/load in-progress game state (AI games only)
- Store game history (completed games with scores)
- Persist custom phase lists
- Persist player display name preferences
- Manage storage capacity and cleanup

**Key Sub-modules**:
- `game-store.js` — Save/resume game state
- `history-store.js` — Completed game records
- `phase-list-store.js` — Custom phase list CRUD
- `settings-store.js` — User preferences (name, display settings)

---

## 6. Game Controller (`src/controller/`)

**Purpose**: Central mediator orchestrating all component interactions.

**Responsibilities**:
- Initialize game sessions (new game, resume, join online)
- Route user actions to the Game Engine
- Trigger AI turns when appropriate
- Coordinate UI updates after state changes
- Manage multiplayer synchronization via Networking
- Handle game lifecycle (start, pause, end, save)
- Coordinate undo operations

**Key Sub-modules**:
- `game-controller.js` — Main orchestrator (mediator)
- `turn-manager.js` — Turn flow coordination
- `session-manager.js` — Game session lifecycle (setup, modes, cleanup)
