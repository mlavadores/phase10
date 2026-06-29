# Business Rules — Phase 10 Web Application

## Game Setup Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| GS-1 | Exactly 2 players per game | Config validation at game start |
| GS-2 | Each player receives exactly 10 cards | Deal function guarantees count |
| GS-3 | First discard card cannot be a Skip | Redraw if Skip dealt to discard |
| GS-4 | Non-dealer goes first | currentPlayerIndex set on deal |
| GS-5 | Default phase list is [1,2,3,4,5,6,7,8,9,10] | Config default |
| GS-6 | Custom phase list must have at least 1 phase | Validation on phase list save |

## Turn Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| TR-1 | Must draw exactly 1 card to start turn | turnPhase state machine |
| TR-2 | Can draw from draw pile OR discard pile (not both) | turnPhase transitions to 'action' after one draw |
| TR-3 | Must discard exactly 1 card to end turn | turnPhase requires discard before advancing |
| TR-4 | Cannot discard the card just drawn from discard pile in same turn | Rule check in isValidDiscard |
| TR-5 | May lay down phase only ONCE per round | hasLaidDown flag prevents repeat |
| TR-6 | May hit only AFTER laying down own phase | canHit checks hasLaidDown |
| TR-7 | May hit on ANY player's laid-down groups | No target restriction |
| TR-8 | Hitting is optional | Player can skip to discard |
| TR-9 | Skipped player loses their entire turn | isSkipped flag, turn advances |
| TR-10 | Player can lay down AND hit in same turn | Both allowed in 'action' phase |

## Phase Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| PR-1 | Phase must be completed in a single lay-down (all groups at once) | validatePhase checks all groups |
| PR-2 | Cannot partial-lay (put some cards down, add more later in same turn) | Lay-down is atomic |
| PR-3 | Phases must be completed in order (cannot skip) | currentPhase tracks progress |
| PR-4 | Failed phase = retry same phase next round | currentPhase unchanged if not laid down |
| PR-5 | Wild cards can substitute for any card in any group | Wild has universal compatibility |
| PR-6 | No limit on Wild cards per group | Any number of Wilds allowed |
| PR-7 | Sets: all non-Wild cards must have same number | Set validation rule |
| PR-8 | Runs: non-Wild cards must form consecutive ascending numbers | Run validation rule |
| PR-9 | Runs cannot wrap (12 does not connect to 1) | Range check 1-12 only |
| PR-10 | Color groups: all non-Wild cards must have same color | Color validation rule |
| PR-11 | A card can only belong to one group in a phase | No double-counting |

## Wild Card Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| WC-1 | Wild can substitute for any number or color | Universal match in validation |
| WC-2 | Wild can be used in sets, runs, and color groups | All group types accept Wild |
| WC-3 | Once laid down as part of a phase, Wild stays in that position | Immutable after lay-down |
| WC-4 | Wild in hand scores 25 penalty points at round end | Scoring rule |
| WC-5 | No limit on Wilds in a single group | Count check only on total cards |

## Skip Card Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| SC-1 | Discarding a Skip card skips the opponent's next turn | isSkipped flag set on discard |
| SC-2 | In 2-player game, Skip always targets the opponent | Auto-target (only 1 opponent) |
| SC-3 | Skip cards cannot be used in phases (not a number card) | Type check in validation |
| SC-4 | Skip card cannot be first discard in a round | Deal logic re-draws |
| SC-5 | Skip in hand scores 15 penalty points | Scoring rule |
| SC-6 | Only one skip can be active at a time per player | Flag is boolean, not cumulative |

## Scoring Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| SR-1 | Cards 1-9: 5 points each | scoreHand calculation |
| SR-2 | Cards 10-12: 10 points each | scoreHand calculation |
| SR-3 | Skip cards: 15 points each | scoreHand calculation |
| SR-4 | Wild cards: 25 points each | scoreHand calculation |
| SR-5 | Score only cards remaining in hand at round end | Only unplayed cards count |
| SR-6 | Scores are cumulative across rounds | Running total in player.score |
| SR-7 | Lower total score is better | Winner determination |

## Game End Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| GE-1 | Game ends when any player completes last phase AND round ends | isGameOver check after round |
| GE-2 | If both players complete last phase same round: lowest score wins | Tie-break comparison |
| GE-3 | If scores also tied: game is a draw | Equality check |
| GE-4 | Player must both complete phase AND have round end to win | Completing phase mid-hand isn't enough |

## Hitting Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| HR-1 | Can only hit after laying down own phase this round | hasLaidDown check |
| HR-2 | Can hit on any player's laid-down groups | No target restriction |
| HR-3 | Hit card must validly extend the target group | validateHit check |
| HR-4 | Sets: hit card must match number (or be Wild) | Set extension rule |
| HR-5 | Runs: hit card must extend at either end (or be Wild at either end) | Run extension rule |
| HR-6 | Color groups: hit card must match color (or be Wild) | Color extension rule |
| HR-7 | Can hit multiple times per turn | No hit limit per turn |
| HR-8 | Hitting is never mandatory | Player choice |

## Undo Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| UR-1 | Only the last action can be undone | Single snapshot |
| UR-2 | Undo available only during own turn | Turn ownership check |
| UR-3 | Undo not available after turn ends | Snapshot cleared on turn end |
| UR-4 | Undo not available in opponent's turn | Active player check |
| UR-5 | Only one undo per action (cannot chain undos) | Snapshot is null after restore |

## Online Multiplayer Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| MP-1 | Host's game engine is authoritative | All validation on host |
| MP-2 | Guest cannot modify state directly | State received read-only |
| MP-3 | Invalid guest actions are rejected silently | Host validates before applying |
| MP-4 | Disconnection timeout: 30 seconds | Timer on disconnect event |
| MP-5 | Undo not available in online mode | Online flag disables undo |

## Persistence Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| PS-1 | Only AI games can be saved/resumed | Mode check on save |
| PS-2 | Online games are not persisted | Online mode excluded from save |
| PS-3 | Auto-save after each turn in AI games | Controller triggers save |
| PS-4 | Game history stores completed games only | Save on endGame() only |
| PS-5 | Custom phase lists persist indefinitely | No auto-expiry |
