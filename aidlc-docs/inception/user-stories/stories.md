# User Stories — Phase 10 Web Application

**Breakdown**: Feature-Based  
**Granularity**: Epic-level  
**Priority**: MoSCoW  

---

## Epic 1: Core Gameplay

### US-1.1: Play a Complete Round
**As a** player, **I want to** play a complete round of Phase 10 following official rules, **so that** the game experience matches the physical card game.

**Priority**: Must

**Personas**: Casual Carlos, Competitive Mia

**Acceptance Criteria**:
- Given a new round starts, When cards are dealt, Then each player receives 10 cards and one card is placed on the discard pile.
- Given it is my turn, When I choose to draw, Then I can pick from either the draw pile or the discard pile.
- Given I have drawn a card, When I end my turn, Then I must discard exactly one card.

---

### US-1.2: Complete and Validate Phases
**As a** player, **I want to** lay down my phase when I have the correct cards, **so that** I can advance to the next phase.

**Priority**: Must

**Personas**: Casual Carlos, Competitive Mia

**Acceptance Criteria**:
- Given I have cards matching my current phase requirement, When I select them and attempt to lay down, Then the phase is validated and placed on the table.
- Given I attempt to lay down an invalid combination, When validation fails, Then I am shown an error and the cards remain in my hand.

---

### US-1.3: Hit on Existing Phases
**As a** player, **I want to** add cards to completed phases on the table (mine or my opponent's), **so that** I can reduce my hand and go out faster.

**Priority**: Must

**Personas**: Competitive Mia

**Acceptance Criteria**:
- Given I have already laid down my phase this round, When I have cards that extend a laid-down set or run, Then I can play them onto that phase group.

---

### US-1.4: Use Wild and Skip Cards
**As a** player, **I want to** use Wild cards as substitutes and Skip cards to skip my opponent, **so that** I can employ strategic card play.

**Priority**: Must

**Personas**: Competitive Mia

**Acceptance Criteria**:
- Given I have a Wild card, When I include it in a phase or hit, Then it substitutes for any number/color as needed.
- Given I discard a Skip card, When the round continues, Then the targeted opponent loses their next turn.

---

### US-1.5: End-of-Round Scoring
**As a** player, **I want to** see scores calculated automatically at the end of each round, **so that** I know the running totals and can track who's winning.

**Priority**: Must

**Personas**: Casual Carlos, Competitive Mia

**Acceptance Criteria**:
- Given a player goes out, When the round ends, Then all remaining cards in each player's hand are scored (1-9: 5pts, 10-12: 10pts, Skip: 15pts, Wild: 25pts).

---

### US-1.6: Win the Game
**As a** player, **I want** the game to end correctly when someone completes Phase 10, **so that** there is a clear winner.

**Priority**: Must

**Personas**: Casual Carlos, Competitive Mia

**Acceptance Criteria**:
- Given a player completes Phase 10 and goes out (or the round ends with Phase 10 completed), When scores are tallied, Then the winner is declared (lowest score if tied on phase completion).

---

## Epic 2: Online Multiplayer

### US-2.1: Host a Game
**As a** player, **I want to** create a game room and get a connection code, **so that** I can invite a friend to play online.

**Priority**: Must

**Personas**: Competitive Mia

**Acceptance Criteria**:
- Given I click "Create Game", When the room is created, Then I receive a shareable code or link to give to my opponent.

---

### US-2.2: Join a Game
**As a** player, **I want to** join my friend's game using their code, **so that** we can play together remotely.

**Priority**: Must

**Personas**: Casual Carlos

**Acceptance Criteria**:
- Given I have a room code, When I enter it and connect, Then I join the game and we can begin playing.

---

### US-2.3: Handle Disconnections
**As a** player, **I want** the game to handle connection drops gracefully, **so that** a brief network issue doesn't ruin the game.

**Priority**: Should

**Personas**: Casual Carlos, Competitive Mia

**Acceptance Criteria**:
- Given a player disconnects, When the connection is lost, Then the opponent is notified and reconnection is attempted within a timeout period.

---

## Epic 3: AI Opponents

### US-3.1: Play Against Easy AI
**As a** casual player, **I want to** play against an Easy AI opponent, **so that** I can enjoy the game solo without a steep challenge.

**Priority**: Must

**Personas**: Casual Carlos

**Acceptance Criteria**:
- Given I select "Play vs AI (Easy)", When the game starts, Then the AI makes basic decisions with a brief thinking delay.

---

### US-3.2: Play Against Hard AI
**As a** competitive player, **I want to** play against a Hard AI opponent, **so that** I am challenged strategically.

**Priority**: Must

**Personas**: Competitive Mia

**Acceptance Criteria**:
- Given I select "Play vs AI (Hard)", When the AI takes its turn, Then it makes strategic decisions (optimal discards, strategic Skip/Wild usage).

---

## Epic 4: Game Management

### US-4.1: Save and Resume Games
**As a** player, **I want to** resume an interrupted AI game later, **so that** I don't lose progress if I close the browser.

**Priority**: Should

**Personas**: Casual Carlos

**Acceptance Criteria**:
- Given I am in an AI game and close the browser, When I return later, Then I can resume from where I left off.

---

### US-4.2: Undo Last Action
**As a** player, **I want to** undo my last action during my turn, **so that** I can correct accidental moves.

**Priority**: Should

**Personas**: Casual Carlos

**Acceptance Criteria**:
- Given I performed an action this turn (draw, discard, lay-down, hit), When I press undo, Then the game state reverts to before that action.

---

### US-4.3: View Game History
**As a** competitive player, **I want to** see my past game results, **so that** I can track my performance over time.

**Priority**: Could

**Personas**: Competitive Mia

**Acceptance Criteria**:
- Given I have completed games previously, When I open game history, Then I see a list of past games with scores and outcomes.

---

## Epic 5: UI/UX

### US-5.1: Responsive Game Interface
**As a** player, **I want** the game to be fully playable on my phone, tablet, or desktop, **so that** I can play anywhere.

**Priority**: Must

**Personas**: Casual Carlos, Competitive Mia

**Acceptance Criteria**:
- Given I open the game on any device (320px width and up), When I interact with cards and controls, Then all elements are usable and properly sized.

---

### US-5.2: Animated Card Interactions
**As a** player, **I want** smooth animations when cards are drawn, discarded, and laid down, **so that** the game feels polished and engaging.

**Priority**: Should

**Personas**: Casual Carlos, Competitive Mia

**Acceptance Criteria**:
- Given a game action occurs (draw, discard, phase lay-down), When it executes, Then a smooth CSS animation shows the card moving.

---

### US-5.3: Learn the Game Rules
**As a** new player, **I want** to read the rules and see a tutorial within the app, **so that** I can learn to play without external resources.

**Priority**: Must

**Personas**: Casual Carlos

**Acceptance Criteria**:
- Given I click "Rules/Help", When the panel opens, Then I see a clear explanation of Phase 10 rules, phases, scoring, and card types.

---

### US-5.4: Accessible Gameplay
**As a** player, **I want** to navigate and play the game entirely with a keyboard, **so that** the game is accessible regardless of input method.

**Priority**: Should

**Personas**: Casual Carlos, Competitive Mia

**Acceptance Criteria**:
- Given I am using keyboard only, When I navigate the game, Then all interactive elements are reachable and operable via keyboard with visible focus indicators.

---

## Epic 6: Custom Phase Lists

### US-6.1: Create Custom Phase Order
**As a** competitive player, **I want to** define a custom order of phases before starting a game, **so that** I can try different variations.

**Priority**: Could

**Personas**: Competitive Mia

**Acceptance Criteria**:
- Given I open the phase list editor, When I rearrange or select phases, Then my custom list is saved and available when starting a new game.

---

### US-6.2: Use Saved Phase Lists
**As a** player, **I want to** select a previously saved custom phase list when starting a game, **so that** I can reuse my favorite configurations.

**Priority**: Could

**Personas**: Competitive Mia

**Acceptance Criteria**:
- Given I have saved custom phase lists, When I start a new game, Then I can choose between standard phases or any saved custom list.

---

## Story Summary

| Epic | Stories | Must | Should | Could |
|------|---------|------|--------|-------|
| Core Gameplay | 6 | 6 | 0 | 0 |
| Online Multiplayer | 3 | 2 | 1 | 0 |
| AI Opponents | 2 | 2 | 0 | 0 |
| Game Management | 3 | 0 | 2 | 1 |
| UI/UX | 4 | 2 | 2 | 0 |
| Custom Phase Lists | 2 | 0 | 0 | 2 |
| **Total** | **20** | **12** | **5** | **3** |
