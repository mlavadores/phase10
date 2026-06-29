# Business Logic Model — Phase 10 Web Application

## 1. Game Lifecycle

### New Game Flow
```
createGame(config) →
  1. Create 2 Player objects (human + AI/human)
  2. Create & shuffle 108-card deck
  3. Deal 10 cards to each player
  4. Place top card of remaining deck on discard pile
  5. Set currentPlayerIndex = 0 (dealer's left, i.e., non-dealer goes first)
  6. Set turnPhase = 'draw'
  7. Set round = 1
  8. Save initial state
```

### Round Flow
```
Round continues until one player discards their last card ("goes out"):
  For each turn:
    1. Check if player is skipped → if yes, clear skip flag, advance turn
    2. DRAW phase: player draws from pile or discard
    3. ACTION phase: player may lay down phase + hit (optional)
    4. DISCARD phase: player discards one card
    5. Check round-end: if player's hand is empty → round over
    6. Advance to next player
```

### End-of-Round Flow
```
endRound() →
  1. Score remaining cards in each player's hand
  2. Add penalty points to cumulative scores
  3. For each player: if they laid down their phase, advance currentPhase += 1
  4. Check game-over: any player's currentPhase > total phases in phaseList?
    → If yes: game over (that player wins, or lowest score if tie)
    → If no: start new round (reshuffle, redeal)
```

### Game-Over Determination
```
isGameOver() →
  1. After round scoring, check all players
  2. If any player completed last phase in phaseList AND went out (or round ended): game over
  3. If multiple players completed last phase same round: lowest cumulative score wins
  4. Winner = player who completed all phases with lowest score
```

---

## 2. Turn State Machine

```
States: draw → action → discard → (next player's draw)

Transitions:
  draw → action:   After player draws 1 card
  action → discard: Player chooses to discard (may skip action)
  discard → draw:   Turn ends, next player starts

Actions allowed per state:
  draw:    drawFromPile() OR drawFromDiscard()
  action:  layDownPhase() [if not already laid down], hit() [if already laid down], OR skip (do nothing)
  discard: discard(card)
```

### Undo Logic
```
Before each action that modifies state:
  1. Store deep copy of current GameState as undoSnapshot
  2. Set lastAction = the action being performed

undo():
  1. If undoSnapshot exists AND we're still in the same turn:
     - Restore state from undoSnapshot
     - Clear undoSnapshot and lastAction
  2. Only one undo level (cannot undo twice)
  3. Undo not available: if turn has ended, or it's opponent's turn
```

---

## 3. Phase Validation Algorithms

### Set Validation
```
validateSet(cards, requiredCount):
  1. Remove Wild cards from consideration
  2. All non-Wild cards must have same number
  3. Total cards (natural + wilds) must equal requiredCount
  4. Return valid if conditions met
```

### Run Validation
```
validateRun(cards, requiredCount):
  1. Separate Wild cards from number cards
  2. Sort number cards by number ascending
  3. Try to form consecutive sequence using number cards + wilds filling gaps
  4. Total cards must equal requiredCount
  5. Sequence must be contiguous (e.g., 3,4,5,6,7 — no gaps unfilled by wilds)
  6. Numbers range 1-12 (cannot wrap around)
  7. Return valid if complete run formed
```

### Color Group Validation
```
validateColorGroup(cards, requiredCount):
  1. Remove Wild cards from consideration
  2. All non-Wild cards must have same color
  3. Total cards (natural + wilds) must equal requiredCount
  4. Return valid if conditions met
```

### Full Phase Validation
```
validatePhase(cardGroups, phaseNumber):
  1. Get PhaseDefinition for phaseNumber
  2. cardGroups must have same length as definition.groups
  3. For each group in cardGroups:
     - Match to corresponding PhaseDefinition.group
     - Validate type (set/run/color) and count
  4. No card appears in more than one group
  5. All cards in groups must come from player's hand
  6. Return valid if ALL groups pass validation
```

### Hit Validation
```
validateHit(card, targetGroup, groupType):
  For sets: card must match the set's number (or be Wild)
  For runs: card must extend the run at either end (consecutive number, or Wild)
  For color groups: card must match the color (or be Wild)
```

---

## 4. Scoring Algorithm

```
scoreHand(hand):
  total = 0
  for each card in hand:
    if card.type === 'number' and card.number <= 9: total += 5
    if card.type === 'number' and card.number >= 10: total += 10
    if card.type === 'skip': total += 15
    if card.type === 'wild': total += 25
  return total
```

---

## 5. AI Decision Logic

### Easy Strategy
```
chooseDrawSource(state):
  - Look at discard top card
  - If card matches current phase need (same number for sets, adjacent for runs, same color): take discard
  - Otherwise: draw from pile (80% of the time) or take discard randomly (20%)

chooseDiscard(state):
  - Identify cards NOT contributing to current phase
  - Discard a random non-useful card
  - Never discard Wild cards unless hand is all Wilds + 1 other card
  - Avoid discarding Skip cards early

attemptLayDown(state):
  - Check if hand has valid phase combination
  - If yes: lay down (always lay down when possible)

attemptHits(state):
  - After laying down, check each remaining hand card against all table groups
  - Hit whenever possible (greedy — hit first valid target found)
```

### Hard Strategy
```
chooseDrawSource(state):
  - Calculate utility score of discard top card relative to current phase progress
  - Calculate expected utility of random draw pile card
  - Take discard if its utility score > average expected draw pile utility
  - Consider: would taking discard reveal strategy to opponent?

chooseDiscard(state):
  - Score all hand cards by utility (contribution to phase completion)
  - Discard lowest-utility card
  - Tie-break: prefer discarding cards opponent is unlikely to need
  - Consider opponent's current phase and what they might collect
  - Never discard Wild cards

attemptLayDown(state):
  - Same as Easy: always lay down when possible
  - Additionally: consider if holding cards gives more hit opportunities

attemptHits(state):
  - After laying down, evaluate all possible hits
  - Prioritize hits that empty the hand fastest (to go out)
  - Prefer hitting own groups (keeps cards visible for strategy)

skipCardStrategy(state):
  - Use Skip card strategically: discard Skip when opponent is close to completing phase
  - Save Skip for critical moments (opponent has few cards left)
```

### AI Timing
```
getThinkingDelay():
  - Return random integer between 500ms and 3000ms
  - Apply per-action (draw, laydown, hit, discard each get separate delay)
  - Total AI turn: 2000ms - 12000ms depending on actions taken
```

---

## 6. WebRTC Protocol (PeerJS)

### Connection Flow
```
Host creates game:
  1. Create PeerJS Peer with random ID
  2. Display Peer ID as "Room Code" to user
  3. Wait for incoming connection

Guest joins:
  1. Create PeerJS Peer
  2. Connect to host using Room Code (peer.connect(hostId))
  3. On connection open: send {type:'join', payload:{playerName}}

Host receives join:
  1. Accept connection
  2. Send {type:'state-update', payload: initialGameState}
  3. Game begins
```

### Message Protocol
```
Host → Guest:
  - state-update: Full GameState after each action (host-authoritative)
  - Sent after EVERY state change

Guest → Host:
  - action: PlayerAction (guest's move request)
  - Host validates via Game Engine before applying
  - If invalid: host sends state-update with unchanged state + error flag

Reconnection:
  - PeerJS handles reconnection automatically within timeout
  - On reconnect: host sends latest state-update
  - If timeout exceeded (30 seconds): game is abandoned
```

### Host Authority Rules
```
1. Host's Game Engine is the single source of truth
2. Guest NEVER modifies game state locally (only renders what host sends)
3. Guest sends action → Host validates → Host applies → Host broadcasts new state
4. This prevents cheating: guest cannot fake invalid moves
```

---

## 7. Deck Management

### Reshuffle Rule
```
When draw pile is empty:
  1. Take all cards from discard pile EXCEPT the top card
  2. Shuffle these cards
  3. Place as new draw pile
  4. Top discard card remains as discard pile
```

### Deal Logic
```
dealRound(state):
  1. Collect all cards (from hands, laid-down groups, discard, draw pile)
  2. Shuffle full 108-card deck
  3. Deal 10 cards to each player
  4. Place next card face-up on discard pile
  5. Remaining cards = draw pile
  6. Reset all player flags (hasLaidDown=false, laidDownGroups=[], isSkipped=false)
```

---

## 8. Skip Card Rules
```
When a Skip card is discarded:
  1. The current player chooses the target (in 2-player: only opponent)
  2. Target player's isSkipped flag = true
  3. On target's next turn: skip is consumed (isSkipped=false), turn advances to next player
  4. Skip card goes to discard pile normally after being played
  5. A Skip card CANNOT be used as the opening discard (if dealt as first discard, re-deal that card into pile and flip next)
```
