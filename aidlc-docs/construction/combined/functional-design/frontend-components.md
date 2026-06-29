# Frontend Components — Phase 10 Web Application

## Web Component Architecture

All UI components use Custom Elements with Shadow DOM for encapsulation. Components receive state from the Controller and emit events back.

---

## Component Hierarchy

```
<game-board>                    (root game container)
├── <game-menu>                 (main menu / game setup screens)
├── <player-hand>               (current player's interactive hand)
│   └── <card-element> (×N)    (individual cards)
├── <opponent-area>             (opponent's face-down cards + info)
│   └── <card-element> (×N)    (face-down cards)
├── <draw-pile>                 (clickable draw pile)
├── <discard-pile>              (visible top card, clickable)
├── <phase-drop-zones>          (drop targets for phase lay-down)
│   └── <drop-zone> (×groups)  (individual group zones)
├── <table-area>                (laid-down phase groups for all players)
│   └── <card-element> (×N)    (laid-down cards)
├── <phase-display>             (phase progress for both players)
├── <score-board>               (running scores)
├── <game-log>                  (action history feed)
├── <turn-indicator>            (whose turn it is)
├── <rules-panel>               (rules/help overlay)
└── <phase-editor>              (custom phase list editor)
```

---

## Component Specifications

### `<game-board>` — Root Container
**Purpose**: Main layout, routes game screens, holds all child components.

**Local State**: currentScreen ('menu' | 'game' | 'results')

**Attributes**: None (initialized via JS)

**Methods**:
- `updateState(state: GameState)` — push state to all children
- `showMessage(text, type)` — display toast notification
- `showScreen(screen)` — switch between menu/game/results

**Events Emitted**: None (top-level container)

---

### `<game-menu>` — Menu & Setup
**Purpose**: Main menu, game mode selection, name entry, settings.

**Local State**: selectedMode, playerName, difficulty, selectedPhaseList

**Screens**:
1. Main menu: New Game (vs AI), Join Online, Resume, History, Settings
2. AI setup: Name entry, difficulty selection, phase list selection
3. Online host: Shows room code after creation
4. Online join: Room code input field
5. Settings: Clear data, about

**Events Emitted**:
- `start-ai-game` → {playerName, difficulty, phaseList}
- `host-online-game` → {playerName}
- `join-online-game` → {playerName, roomCode}
- `resume-game` → {}
- `open-history` → {}
- `open-phase-editor` → {}

---

### `<player-hand>` — Interactive Hand
**Purpose**: Display and interact with current player's cards.

**Local State**: selectedCards (Set of card IDs), isDragging

**Attributes**: `cards` (JSON array), `disabled` (boolean)

**Interactions**:
- Click/tap card → toggle selection (add/remove from selectedCards)
- Drag card → initiate drag for hitting or phase drop zones
- Long-press (mobile) → initiate drag

**Methods**:
- `setCards(cards)` — update displayed cards
- `getSelectedCards()` — return currently selected card objects
- `clearSelection()` — deselect all
- `highlightPlayable(cardIds)` — visual hint for valid plays

**Events Emitted**:
- `card-selected` → {cardId, selected: boolean}
- `card-drag-start` → {cardId}
- `card-drag-end` → {cardId, target}

**Accessibility**: Arrow keys navigate between cards, Space/Enter toggles selection, role="listbox"

---

### `<card-element>` — Single Card
**Purpose**: Render one card (face-up or face-down).

**Attributes**: `card-id`, `number`, `color`, `type`, `face-down`, `selected`, `draggable`

**Rendering**:
- Face-up: Show number and color with visual design
- Face-down: Show card back pattern
- Selected: Raised/highlighted border
- Wild: Special design (multicolor or star symbol)
- Skip: Special design (circle-slash symbol)

**CSS Custom Properties**: `--card-color` for theming

**Accessibility**: aria-label="[color] [number]" or "Wild card" or "Skip card"

---

### `<phase-drop-zones>` — Phase Lay-Down Target
**Purpose**: Drag-drop targets for laying down phase groups.

**Local State**: isActive (visible only when player can lay down)

**Behavior**:
- Shows N drop zones matching current phase's group count (1 or 2 zones)
- Each zone labeled: "Group 1: Set of 3", "Group 2: Run of 4", etc.
- Accept card drops, validate count per zone
- "Confirm Lay Down" button appears when all zones have correct card counts
- "Cancel" clears all zones and returns cards to hand

**Events Emitted**:
- `phase-laydown-confirm` → {groups: Card[][]}
- `phase-laydown-cancel` → {}

**Accessibility**: Drop zones are focusable, keyboard users can move selected cards into zones with Enter

---

### `<discard-pile>` / `<draw-pile>` — Pile Components
**Purpose**: Clickable card sources for drawing.

**Behavior**:
- Draw pile: Click to draw (shows face-down card back, click animation)
- Discard pile: Shows top card face-up, click to take it
- Only clickable when it's player's turn AND turnPhase === 'draw'

**Events Emitted**:
- `draw-from-pile` → {}
- `draw-from-discard` → {}

**Accessibility**: role="button", aria-label="Draw pile (N cards remaining)" / "Discard pile, top card: [description]"

---

### `<phase-display>` — Phase Progress Tracker
**Purpose**: Show each player's current phase and progress.

**Display**:
- For each player: name, current phase number, phase description
- Visual indicator (checkmarks for completed phases, current phase highlighted)
- Compact display on mobile (current phase only)

---

### `<score-board>` — Scores
**Purpose**: Display cumulative scores for both players.

**Display**:
- Player names, scores, current phase
- Round-end summary (shows penalty breakdown)
- Final game results screen

---

### `<game-log>` — Action Feed
**Purpose**: Scrollable log of recent game actions.

**Entries**: "Player drew from pile", "Player discarded Red 7", "Player completed Phase 3!", "Player hit on opponent's set"

**Max entries**: Last 20 actions displayed, older entries auto-removed

---

### `<rules-panel>` — Rules/Tutorial
**Purpose**: Overlay panel explaining game rules.

**Content sections**:
1. Game overview
2. Card types and values
3. Turn structure
4. Phase descriptions (all 10)
5. Scoring
6. Special cards (Wild, Skip)
7. Hitting rules
8. Winning conditions

---

### `<phase-editor>` — Custom Phase List
**Purpose**: Create and manage custom phase lists.

**Interactions**:
- Select phases from a list of 10 available phase types
- Drag to reorder
- Name the custom list
- Save / Delete / Load

---

## Animation Specifications

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Card draw (pile to hand) | 400ms | ease-out | drawFromPile/drawFromDiscard |
| Card discard (hand to pile) | 300ms | ease-in | discard action |
| Card lay-down (hand to table) | 500ms | ease-in-out | phase completion |
| Card hit (hand to table group) | 350ms | ease-out | hit action |
| Phase complete celebration | 1500ms | ease-in-out | validatePhase success |
| Turn indicator slide | 300ms | ease | nextTurn |
| Score reveal | 800ms | ease-out | endRound |

**Reduced motion**: All animations collapse to instant transitions when `prefers-reduced-motion: reduce` is active.

---

## Responsive Breakpoints

| Breakpoint | Layout Changes |
|-----------|---------------|
| < 480px (mobile portrait) | Cards small, stacked hand, vertical layout, bottom-anchored hand |
| 480-768px (mobile landscape / small tablet) | Cards medium, horizontal hand, compact board |
| 768-1024px (tablet) | Full card size, horizontal layout, side panels |
| > 1024px (desktop) | Maximum card size, full horizontal layout with game log sidebar |

---

## Keyboard Navigation Map

| Key | Action |
|-----|--------|
| Arrow Left/Right | Navigate cards in hand |
| Space / Enter | Select/deselect card, activate button |
| Tab | Move between zones (hand, piles, actions) |
| U | Undo last action |
| Escape | Cancel current selection / close overlay |
| H | Open rules/help panel |
| ? | Open rules/help panel |
