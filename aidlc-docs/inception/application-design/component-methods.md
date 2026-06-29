# Component Methods — Phase 10 Web Application

Method signatures and high-level purpose for each component. Detailed business rules will be defined in Functional Design.

---

## 1. Game Engine

### deck.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| createDeck | `() → Card[]` | Create standard 108-card Phase 10 deck |
| shuffle | `(cards: Card[]) → Card[]` | Fisher-Yates shuffle |
| drawFromPile | `(state: GameState) → { card: Card, state: GameState }` | Draw top card from draw pile |
| drawFromDiscard | `(state: GameState) → { card: Card, state: GameState }` | Take top card from discard pile |
| discard | `(state: GameState, card: Card) → GameState` | Place card on discard pile |
| reshuffleDiscard | `(state: GameState) → GameState` | Reshuffle discard into draw pile when empty |

### phase-validator.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| validatePhase | `(cards: Card[], phaseNumber: number) → ValidationResult` | Check if cards satisfy a phase requirement |
| getPhaseDefinition | `(phaseNumber: number) → PhaseDefinition` | Get phase requirements (sets, runs, colors) |
| findValidCombinations | `(hand: Card[], phaseNumber: number) → Card[][]` | Find possible valid groupings in hand |
| validateHit | `(card: Card, targetGroup: Card[]) → boolean` | Check if a card can be added to a laid-down group |

### game-state.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| createInitialState | `(players: Player[], phaseList?: number[]) → GameState` | Initialize new game state |
| getSnapshot | `(state: GameState) → GameState` | Deep copy for undo support |
| restoreSnapshot | `(snapshot: GameState) → GameState` | Restore from undo snapshot |
| advancePhase | `(state: GameState, playerId: string) → GameState` | Move player to next phase |
| nextTurn | `(state: GameState) → GameState` | Advance to next player's turn |

### scoring.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| scoreHand | `(hand: Card[]) → number` | Calculate penalty points for remaining cards |
| updateScores | `(state: GameState) → GameState` | Apply end-of-round scoring |
| getWinner | `(state: GameState) → Player or null` | Determine game winner (if game over) |

### rules.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| isValidDraw | `(state: GameState, source: 'pile' or 'discard') → boolean` | Check if draw action is legal |
| isValidDiscard | `(state: GameState, card: Card) → boolean` | Check if discard is legal (can't discard Skip to discard pile first draw) |
| canLayDownPhase | `(state: GameState, playerId: string) → boolean` | Check if player is eligible to lay down |
| canHit | `(state: GameState, playerId: string) → boolean` | Check if player has already laid down this round |
| isRoundOver | `(state: GameState) → boolean` | Check if someone went out |
| isGameOver | `(state: GameState) → boolean` | Check if game ending conditions met |

---

## 2. Networking

### peer-connection.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| createHost | `() → { connection: RTCPeerConnection, offer: string }` | Create host connection, generate offer SDP |
| joinGame | `(offer: string) → { connection: RTCPeerConnection, answer: string }` | Join with offer, produce answer SDP |
| completeConnection | `(answer: string) → void` | Host completes connection with answer |
| getConnectionState | `() → 'connecting' or 'connected' or 'disconnected'` | Current connection status |
| close | `() → void` | Close connection and cleanup |

### data-channel.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| send | `(message: GameMessage) → void` | Serialize and send message to peer |
| onMessage | `(handler: (msg: GameMessage) → void) → void` | Register message handler |
| onStateChange | `(handler: (state: string) → void) → void` | Register channel state handler |

### sync.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| broadcastState | `(state: GameState) → void` | Host sends full state to peer |
| sendAction | `(action: PlayerAction) → void` | Guest sends action to host for validation |
| handleIncoming | `(message: GameMessage) → GameState or PlayerAction` | Parse incoming message |

---

## 3. AI

### ai-player.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| takeTurn | `(state: GameState, difficulty: 'easy' or 'hard') → Promise<PlayerAction[]>` | Execute full AI turn with delay |
| chooseDrawSource | `(state: GameState, strategy: Strategy) → 'pile' or 'discard'` | Decide where to draw from |
| chooseDiscard | `(state: GameState, strategy: Strategy) → Card` | Select card to discard |
| attemptPhaseLayDown | `(state: GameState, strategy: Strategy) → Card[][] or null` | Try to lay down phase |
| attemptHits | `(state: GameState, strategy: Strategy) → HitAction[]` | Find hitting opportunities |

### card-evaluator.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| evaluateCardUtility | `(card: Card, hand: Card[], phaseNum: number) → number` | Score card's usefulness for current phase |
| groupByPhaseProgress | `(hand: Card[], phaseNum: number) → CardGroup[]` | Identify partial phase groupings in hand |

---

## 4. UI (Web Components)

### game-board.js (`<game-board>`)
| Method | Signature | Purpose |
|--------|-----------|---------|
| updateState | `(state: GameState) → void` | Receive new state and re-render children |
| showMessage | `(text: string, type: string) → void` | Display toast/notification |

### player-hand.js (`<player-hand>`)
| Method | Signature | Purpose |
|--------|-----------|---------|
| setCards | `(cards: Card[]) → void` | Update displayed cards |
| getSelectedCards | `() → Card[]` | Get currently selected cards |
| clearSelection | `() → void` | Deselect all cards |

### card-element.js (`<card-element>`)
| Method | Signature | Purpose |
|--------|-----------|---------|
| setCard | `(card: Card) → void` | Set card data (number, color, type) |
| setFaceDown | `(faceDown: boolean) → void` | Toggle face-down display |
| animateTo | `(target: Element) → Promise<void>` | Animate card movement to target |

---

## 5. Storage

### game-store.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| saveGame | `(state: GameState) → void` | Persist current game state |
| loadGame | `() → GameState or null` | Load saved game state |
| hasSavedGame | `() → boolean` | Check if a saved game exists |
| clearSavedGame | `() → void` | Delete saved game |

### history-store.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| addGameResult | `(result: GameResult) → void` | Store completed game record |
| getHistory | `() → GameResult[]` | Retrieve all past game results |
| clearHistory | `() → void` | Delete all history |

### phase-list-store.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| savePhaseLists | `(lists: PhaseList[]) → void` | Store custom phase lists |
| getPhaseLists | `() → PhaseList[]` | Retrieve custom phase lists |
| deletePhaseLists | `(id: string) → void` | Remove a specific list |

---

## 6. Game Controller

### game-controller.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| startNewGame | `(config: GameConfig) → void` | Initialize and start a new game |
| resumeGame | `() → void` | Resume saved game from storage |
| handlePlayerAction | `(action: PlayerAction) → void` | Process player action through engine |
| handleAITurn | `() → Promise<void>` | Trigger and process AI turn |
| undo | `() → void` | Revert last action using snapshot |
| endRound | `() → void` | Process round end, scoring, phase advancement |
| endGame | `() → void` | Process game over, record results |

### session-manager.js
| Method | Signature | Purpose |
|--------|-----------|---------|
| createOnlineSession | `() → string` | Create host session, return offer |
| joinOnlineSession | `(offer: string) → string` | Join session, return answer |
| completeOnlineSetup | `(answer: string) → void` | Finalize P2P connection |
| getSessionMode | `() → 'local-ai' or 'online'` | Current session type |
