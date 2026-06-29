# Services — Phase 10 Web Application

## Service Architecture

The application uses a **Mediator/Controller** pattern. The Game Controller acts as the single orchestration layer, coordinating all components. There are no separate "service" layers — the controller IS the service layer.

---

## Game Controller Service (Mediator)

**Role**: Central orchestrator that coordinates all component interactions. No component talks directly to another — all communication flows through the controller.

### Orchestration Flows

#### Flow 1: New Game (vs AI)
```
User → UI(game-menu) → Controller.startNewGame(config)
  → GameEngine.createInitialState(players)
  → UI(game-board).updateState(state)
  → Storage.saveGame(state)
```

#### Flow 2: Player Turn (Draw)
```
User → UI(draw-pile click) → Controller.handlePlayerAction({type: 'draw', source: 'pile'})
  → GameEngine.rules.isValidDraw(state, 'pile')
  → GameEngine.deck.drawFromPile(state)
  → Controller stores undo snapshot
  → UI(player-hand).setCards(newHand)
  → UI(card-element).animateTo(hand)
```

#### Flow 3: Player Turn (Lay Down Phase)
```
User → UI(player-hand).getSelectedCards() → Controller.handlePlayerAction({type: 'laydown', cards})
  → GameEngine.phaseValidator.validatePhase(cards, phaseNum)
  → IF valid: GameEngine.gameState.advancePhase(state, playerId)
  → UI(phase-display).update()
  → UI: phase completion animation
  → IF invalid: UI(game-board).showMessage("Invalid phase")
```

#### Flow 4: Player Turn (Discard / End Turn)
```
User → UI(card click for discard) → Controller.handlePlayerAction({type: 'discard', card})
  → GameEngine.rules.isValidDiscard(state, card)
  → GameEngine.deck.discard(state, card)
  → Check: GameEngine.rules.isRoundOver(state)?
    → IF yes: Controller.endRound()
    → IF no: GameEngine.gameState.nextTurn(state)
      → IF next is AI: Controller.handleAITurn()
      → IF next is human (online): Networking.sync.broadcastState(state)
```

#### Flow 5: AI Turn
```
Controller.handleAITurn()
  → AI.aiPlayer.takeTurn(state, difficulty) → actions[]
  → For each action: Controller.handlePlayerAction(action)
  → UI updates with animation delays
  → Controller advances turn
```

#### Flow 6: Online Multiplayer (Host receives action)
```
Networking.dataChannel.onMessage(msg)
  → Controller.handlePlayerAction(msg.action)  [host validates]
  → GameEngine processes action
  → Networking.sync.broadcastState(newState)  [send updated state to guest]
  → UI(game-board).updateState(newState)
```

#### Flow 7: Online Multiplayer (Guest receives state)
```
Networking.dataChannel.onMessage(msg)
  → Controller receives validated state from host
  → UI(game-board).updateState(msg.state)
```

#### Flow 8: Undo
```
User → UI(undo button) → Controller.undo()
  → GameEngine.gameState.restoreSnapshot(lastSnapshot)
  → UI(game-board).updateState(restoredState)
```

#### Flow 9: End of Round
```
Controller.endRound()
  → GameEngine.scoring.updateScores(state)
  → Check: GameEngine.rules.isGameOver(state)?
    → IF yes: Controller.endGame()
    → IF no: GameEngine deals new round
  → UI(score-board) shows round summary
  → Storage.saveGame(state)
```

---

## Service Boundaries

| Concern | Handled By | NOT Handled By |
|---------|-----------|----------------|
| Game rules | Game Engine | Controller, UI, AI |
| User input | UI Components | Controller (receives processed actions) |
| AI decisions | AI Module | Controller (triggers and relays) |
| Network I/O | Networking | Controller (coordinates) |
| Persistence | Storage | Controller (triggers save/load) |
| Orchestration | Controller | Everything else |
| Rendering | UI Components | Everything else |
