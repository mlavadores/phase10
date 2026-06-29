# Domain Entities — Phase 10 Web Application

## Core Entities

### Card
```javascript
{
  id: string,           // Unique identifier (e.g., "r7-1", "wild-3", "skip-2")
  type: 'number' | 'wild' | 'skip',
  number: number | null,  // 1-12 for number cards, null for wild/skip
  color: 'red' | 'blue' | 'green' | 'yellow' | null  // null for wild/skip
}
```

**Card Distribution (108 total)**:
- Numbers 1-12: 2 of each per color (4 colors) = 96 cards
- Wild: 8 cards (no color, no number)
- Skip: 4 cards (no color, no number)

---

### Player
```javascript
{
  id: string,             // Unique player ID
  name: string,           // Display name
  hand: Card[],           // Current cards in hand
  currentPhase: number,   // 1-10 (which phase they're working on)
  hasLaidDown: boolean,   // Whether they laid down their phase this round
  laidDownGroups: Card[][], // Card groups laid on table (after phase completion)
  score: number,          // Cumulative score (penalty points)
  isAI: boolean,          // Whether this is an AI player
  difficulty: 'easy' | 'hard' | null,  // AI difficulty (null for human)
  isSkipped: boolean      // Whether this player's next turn is skipped
}
```

---

### GameState
```javascript
{
  id: string,                // Game session ID
  players: Player[],         // Array of 2 players
  currentPlayerIndex: number, // 0 or 1
  drawPile: Card[],          // Face-down draw pile
  discardPile: Card[],       // Face-up discard pile (last = top)
  round: number,             // Current round number (1+)
  turnPhase: 'draw' | 'action' | 'discard',  // Current turn step
  phaseList: number[],       // Phase order (default: [1,2,3,4,5,6,7,8,9,10])
  gameOver: boolean,         // Whether game has ended
  winner: string | null,     // Winner player ID (null if ongoing)
  lastAction: PlayerAction | null,  // For undo support
  undoSnapshot: GameState | null,   // Previous state for undo
  config: GameConfig         // Session configuration
}
```

---

### GameConfig
```javascript
{
  mode: 'ai' | 'online',
  difficulty: 'easy' | 'hard' | null,  // null for online
  playerNames: [string, string],
  phaseList: number[],       // Default [1..10] or custom
  customPhaseListId: string | null
}
```

---

### PhaseDefinition
```javascript
{
  phaseNumber: number,     // 1-10
  description: string,    // Human-readable (e.g., "2 sets of 3")
  groups: PhaseGroup[]     // Required groups for this phase
}

// PhaseGroup
{
  type: 'set' | 'run' | 'color',
  count: number           // Number of cards required in this group
}
```

**Official Phase Definitions**:
| Phase | Description | Groups |
|-------|-------------|--------|
| 1 | 2 sets of 3 | [{type:'set', count:3}, {type:'set', count:3}] |
| 2 | 1 set of 3 + 1 run of 4 | [{type:'set', count:3}, {type:'run', count:4}] |
| 3 | 1 set of 4 + 1 run of 4 | [{type:'set', count:4}, {type:'run', count:4}] |
| 4 | 1 run of 7 | [{type:'run', count:7}] |
| 5 | 1 run of 8 | [{type:'run', count:8}] |
| 6 | 1 run of 9 | [{type:'run', count:9}] |
| 7 | 2 sets of 4 | [{type:'set', count:4}, {type:'set', count:4}] |
| 8 | 7 cards of 1 color | [{type:'color', count:7}] |
| 9 | 1 set of 5 + 1 set of 2 | [{type:'set', count:5}, {type:'set', count:2}] |
| 10 | 1 set of 5 + 1 set of 3 | [{type:'set', count:5}, {type:'set', count:3}] |

---

### PlayerAction
```javascript
{
  type: 'draw' | 'discard' | 'laydown' | 'hit' | 'skip-target',
  playerId: string,
  payload: {
    source?: 'pile' | 'discard',    // for draw
    card?: Card,                     // for discard, hit
    groups?: Card[][],               // for laydown (array of card groups)
    targetPlayerId?: string,         // for hit (whose group to add to)
    targetGroupIndex?: number        // for hit (which group index)
  }
}
```

---

### GameMessage (Networking)
```javascript
{
  type: 'action' | 'state-update' | 'join' | 'ready' | 'disconnect' | 'reconnect',
  payload: PlayerAction | GameState | { playerName: string },
  timestamp: number
}
```

---

### GameResult (History)
```javascript
{
  id: string,
  date: string,         // ISO timestamp
  players: [{ name: string, score: number, finalPhase: number }],
  winnerId: string,
  rounds: number,
  phaseList: number[],
  mode: 'ai' | 'online',
  difficulty: 'easy' | 'hard' | null
}
```

---

### PhaseList (Custom)
```javascript
{
  id: string,
  name: string,
  phases: number[],     // Array of phase numbers in custom order
  createdAt: string     // ISO timestamp
}
```
