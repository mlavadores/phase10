/**
 * Phase 10 — Game Controller (Central Mediator)
 * 
 * Orchestrates all component interactions: processes player actions,
 * triggers AI turns, manages online sync, handles game lifecycle.
 */

/** @typedef {import('../types.js').GameState} GameState */
/** @typedef {import('../types.js').PlayerAction} PlayerAction */

import { processAction, performUndo } from './turn-manager.js';
import { SessionManager } from './session-manager.js';
import { takeTurn } from '../ai/ai-player.js';
import {
  isRoundOver, isGameOver, canUndo, getPlayerPhaseNumber,
  advancePhase, updateScores, getWinner, dealNewRound, nextTurn,
  getCurrentPlayer, getOpponent, getPhaseDefinition, validatePhase
} from '../game-engine/index.js';
import { saveGame, clearSavedGame, loadGame, hasSavedGame } from '../storage/game-store.js';
import { addGameResult } from '../storage/history-store.js';
import { getSettings } from '../storage/settings-store.js';

export class GameController {
  /**
   * @param {import('../ui/game-board.js').GameBoard} board
   */
  constructor(board) {
    /** @type {import('../ui/game-board.js').GameBoard} */
    this._board = board;
    /** @type {GameState | null} */
    this._state = null;
    /** @type {SessionManager} */
    this._session = new SessionManager();
    /** @type {boolean} */
    this._aiTurnInProgress = false;
    /** @type {boolean} */
    this._hitModeActive = false;
  }

  /**
   * Initialize the controller — wire up event listeners.
   */
  init() {
    const board = this._board;

    // Menu events
    board.menu.addEventListener('start-ai-game', (e) => {
      const { playerName, difficulty } = e.detail;
      this.startAIGame(playerName, difficulty);
    });

    board.menu.addEventListener('host-online-game', async (e) => {
      const { playerName } = e.detail;
      await this.hostOnlineGame(playerName);
    });

    board.menu.addEventListener('join-online-game', async (e) => {
      const { playerName, roomCode } = e.detail;
      await this.joinOnlineGame(playerName, roomCode);
    });

    board.menu.addEventListener('resume-game', () => {
      this.resumeGame();
    });

    // Game actions
    board.drawPileEl.addEventListener('click', () => {
      this._handlePlayerDraw('pile');
    });
    board.drawPileEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') this._handlePlayerDraw('pile');
    });

    board.discardPileEl.addEventListener('click', () => {
      this._handlePlayerDraw('discard');
    });
    board.discardPileEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') this._handlePlayerDraw('discard');
    });

    // Discard button — explicit button to discard the selected card
    board.shadowRoot.querySelector('[data-testid="btn-discard"]')
      .addEventListener('click', () => {
        if (!this._state) return;
        const selected = board.playerHand.getSelectedCards();
        if (selected.length === 1) {
          this._handlePlayerDiscard(selected[0]);
          board.playerHand.clearSelection();
        } else if (selected.length === 0) {
          board.showMessage('Select 1 card from your hand to discard');
        } else {
          board.showMessage('Select only 1 card to discard');
        }
      });

    // Selection change — update button states
    board.playerHand.addEventListener('selection-change', (e) => {
      if (!this._state) return;
      // Discard button: needs exactly 1 card selected during action phase
      const discardBtn = board.shadowRoot.querySelector('[data-testid="btn-discard"]');
      const isMyTurn = this._state.players[this._state.currentPlayerIndex].id === 
        this._getLocalPlayerId();
      if (isMyTurn && this._state.turnPhase === 'action') {
        discardBtn.disabled = e.detail.selectedCards.length !== 1;
      }
    });

    // Lay down button
    board.shadowRoot.querySelector('[data-testid="btn-laydown"]')
      .addEventListener('click', () => this._handleLayDown());

    // Hit button — toggle hit mode
    board.shadowRoot.querySelector('[data-testid="btn-hit"]')
      .addEventListener('click', () => this._toggleHitMode());

    // Hit on group click (when hit mode is active)
    board.addEventListener('hit-group-click', (e) => {
      if (!this._hitModeActive) return;
      const { targetPlayerId, targetGroupIndex } = e.detail;
      this._performHit(targetPlayerId, targetGroupIndex);
    });

    // Undo button
    board.shadowRoot.querySelector('[data-testid="btn-undo"]')
      .addEventListener('click', () => this.undo());

    // Check for saved game
    if (hasSavedGame()) {
      board.menu.showResumeButton(true);
    }
  }

  /**
   * Start a new AI game.
   * @param {string} playerName
   * @param {string} difficulty
   */
  startAIGame(playerName, difficulty) {
    this._state = this._session.startAIGame(playerName, difficulty);
    this._board.setLocalPlayerId(this._state.players[0].id);
    this._board.showScreen('game');
    this._updateUI();
    this._board.addLog(`Game started: ${playerName} vs AI (${difficulty})`);
    saveGame(this._state);
  }

  /**
   * Host an online game.
   * @param {string} playerName
   */
  async hostOnlineGame(playerName) {
    try {
      const { roomCode, onPlayerJoined } = await this._session.createOnlineSession(playerName);
      this._board.menu.showRoomCode(roomCode);
      this._board.showMessage(`Room code: ${roomCode}`);

      onPlayerJoined((opponentName) => {
        this._state = this._session.createOnlineGameState(playerName, opponentName);
        this._board.setLocalPlayerId(this._state.players[0].id);
        // Broadcast initial state to guest
        const sync = this._session.getSync();
        if (sync) sync.broadcastState(this._state);
        this._board.showScreen('game');
        this._updateUI();
        this._board.addLog(`${opponentName} joined! Game started.`);
      });
    } catch (err) {
      this._board.showMessage('Failed to create room. Please try again.');
    }
  }

  /**
   * Join an online game.
   * @param {string} playerName
   * @param {string} roomCode
   */
  async joinOnlineGame(playerName, roomCode) {
    try {
      await this._session.joinOnlineSession(playerName, roomCode);
      
      // Mark this client as guest IMMEDIATELY
      this._isGuest = true;

      // Register state handler BEFORE the join message triggers host response
      const sync = this._session.getSync();
      if (sync) {
        sync.onStateReceived((state) => {
          this._state = state;
          // Guest is ALWAYS player[1]
          this._board.setLocalPlayerId(state.players[1].id);
          this._board.showScreen('game');
          this._updateUI();
        });
      }

      // NOW send the join message (which triggers host to broadcast state)
      this._session.sendJoinMessage(playerName);

      this._board.showMessage('Connected! Waiting for game to start...');
    } catch (err) {
      this._board.showMessage('Failed to join. Check the room code and try again.');
    }
  }

  /**
   * Resume a saved game.
   */
  resumeGame() {
    const saved = loadGame();
    if (!saved) {
      this._board.showMessage('No saved game found.');
      return;
    }
    this._state = saved;
    this._board.setLocalPlayerId(saved.players[0].id);
    this._session.startAIGame(saved.config.playerNames[0], saved.config.difficulty);
    this._state = saved; // Override the new state with saved
    this._board.showScreen('game');
    this._updateUI();
    this._board.addLog('Game resumed from save.');
  }

  /**
   * Undo the last action.
   */
  undo() {
    if (!this._state) return;
    const localPlayer = this._getLocalPlayer();
    if (!localPlayer || !canUndo(this._state, localPlayer.id)) {
      this._board.showMessage('Cannot undo right now');
      return;
    }

    const restored = performUndo(this._state);
    if (restored) {
      this._state = restored;
      this._updateUI();
      this._board.addLog('Action undone');
      this._board.showMessage('Undo successful');
    }
  }

  /**
   * Toggle hit mode on/off.
   */
  _toggleHitMode() {
    this._hitModeActive = !this._hitModeActive;
    this._board.setHitMode(this._hitModeActive);
    
    if (this._hitModeActive) {
      this._board.showMessage('Hit mode ON — Select 1 card from your hand, then click a group on the table');
    } else {
      this._board.showMessage('Hit mode OFF');
    }
  }

  /**
   * Perform a hit action: add the selected card to the target group.
   * @param {string} targetPlayerId
   * @param {number} targetGroupIndex
   */
  _performHit(targetPlayerId, targetGroupIndex) {
    if (!this._state) return;

    const localPlayer = this._getLocalPlayer();
    if (!localPlayer) return;

    const selectedCards = this._board.playerHand.getSelectedCards();
    if (selectedCards.length !== 1) {
      this._board.showMessage('Select exactly 1 card from your hand to hit');
      return;
    }

    const card = selectedCards[0];

    /** @type {PlayerAction} */
    const action = {
      type: 'hit',
      playerId: localPlayer.id,
      payload: { card, targetPlayerId, targetGroupIndex }
    };

    const result = this._applyAction(action);
    if (result) {
      this._board.playerHand.clearSelection();
      this._board.addLog(`<span class="player-name">${localPlayer.name}</span> hit a card onto a group`);
      
      // Check if player went out (hand empty after hit)
      if (localPlayer.hand.length === 0) {
        this._hitModeActive = false;
        this._board.setHitMode(false);
        this._afterDiscard(); // Triggers round end
        return;
      }
      
      // Stay in hit mode for more hits
      this._updateUI();
    }
  }

  /**
   * Handle player drawing a card.
   * @param {'pile' | 'discard'} source
   */
  _handlePlayerDraw(source) {
    if (!this._state || this._aiTurnInProgress) return;

    const localPlayer = this._getLocalPlayer();
    if (!localPlayer) return;

    // Must be local player's turn
    if (getCurrentPlayer(this._state).id !== localPlayer.id) return;

    /** @type {PlayerAction} */
    const action = {
      type: 'draw',
      playerId: localPlayer.id,
      payload: { source }
    };

    this._applyAction(action);
  }

  /**
   * Handle player discarding a card.
   * @param {import('../types.js').Card} card
   */
  _handlePlayerDiscard(card) {
    if (!this._state || this._aiTurnInProgress) return;

    // Turn off hit mode when discarding
    this._hitModeActive = false;
    this._board.setHitMode(false);

    const localPlayer = this._getLocalPlayer();
    if (!localPlayer) return;

    /** @type {PlayerAction} */
    const action = {
      type: 'discard',
      playerId: localPlayer.id,
      payload: { card }
    };

    const result = this._applyAction(action);
    if (!result) return;

    // Handle Skip card discard
    if (card.type === 'skip') {
      const opponent = getOpponent(this._state);
      if (opponent) {
        this._applyAction({
          type: 'skip-target',
          playerId: localPlayer.id,
          payload: { targetPlayerId: opponent.id }
        });
        this._board.addLog(`<span class="player-name">${localPlayer.name}</span> skipped ${opponent.name}!`);
      }
    }

    // After discard, check round end and advance turn
    this._afterDiscard();
  }

  /**
   * Handle phase lay-down attempt.
   */
  _handleLayDown() {
    if (!this._state || this._aiTurnInProgress) return;

    const localPlayer = this._getLocalPlayer();
    if (!localPlayer) return;

    const selectedCards = this._board.playerHand.getSelectedCards();
    if (selectedCards.length === 0) {
      this._board.showMessage('Select cards for your phase first');
      return;
    }

    // For simplicity, try as a single group first, then split if phase needs 2 groups
    const phaseNumber = getPlayerPhaseNumber(this._state, localPlayer.id);
    const phaseDef = getPhaseDefinition(phaseNumber);

    if (!phaseDef) {
      this._board.showMessage('Could not determine phase definition');
      return;
    }

    // Calculate total cards needed for the phase
    const totalNeeded = phaseDef.groups.reduce((sum, g) => sum + g.count, 0);
    if (selectedCards.length !== totalNeeded) {
      this._board.showMessage(`Phase ${phaseNumber} needs exactly ${totalNeeded} cards (${phaseDef.description}). You selected ${selectedCards.length}.`);
      return;
    }

    let groups;
    if (phaseDef.groups.length === 1) {
      groups = [selectedCards];
    } else {
      // Intelligently split cards into valid groups
      // Try all possible combinations to find a valid partition
      groups = this._findValidPartition(selectedCards, phaseDef);
      if (!groups) {
        this._board.showMessage(`Could not form valid groups for Phase ${phaseNumber} (${phaseDef.description}). Make sure you have the right cards selected.`);
        return;
      }
    }

    /** @type {PlayerAction} */
    const action = {
      type: 'laydown',
      playerId: localPlayer.id,
      payload: { groups }
    };

    const result = this._applyAction(action);
    if (result) {
      this._board.playerHand.clearSelection();
      this._board.addLog(`<span class="player-name">${localPlayer.name}</span> completed Phase ${phaseNumber}!`);
      this._board.showMessage(`Phase ${phaseNumber} complete!`);
    }
  }

  /**
   * Find a valid partition of selected cards into phase groups.
   * Tries all combinations of splitting cards to match group definitions.
   * Also tries swapping group assignments for phases with different group types
   * (e.g., Phase 2: set of 3 + run of 4 — cards for the set might be picked as run or vice versa).
   * @param {import('../types.js').Card[]} cards - Selected cards
   * @param {import('../types.js').PhaseDefinition} phaseDef - Phase definition
   * @returns {import('../types.js').Card[][] | null} Valid groups or null
   */
  _findValidPartition(cards, phaseDef) {
    const groupDefs = phaseDef.groups;
    
    if (groupDefs.length === 2) {
      const count1 = groupDefs[0].count;
      const count2 = groupDefs[1].count;

      // Try: pick count1 cards for group1, remainder for group2
      const combinations1 = this._getCombinations(cards, count1);
      
      for (const group1 of combinations1) {
        const group1Ids = new Set(group1.map(c => c.id));
        const group2 = cards.filter(c => !group1Ids.has(c.id));
        
        if (group2.length !== count2) continue;

        const result = validatePhase([group1, group2], phaseDef.phaseNumber);
        if (result.valid) {
          return [group1, group2];
        }
      }

      // If groups have different sizes, also try the reverse assignment
      // (pick count2 cards for group1 position, count1 for group2 position)
      // This handles cases where the user selected cards that fit better swapped
      if (count1 !== count2) {
        const combinations2 = this._getCombinations(cards, count2);
        
        for (const group2 of combinations2) {
          const group2Ids = new Set(group2.map(c => c.id));
          const group1 = cards.filter(c => !group2Ids.has(c.id));
          
          if (group1.length !== count1) continue;

          const result = validatePhase([group1, group2], phaseDef.phaseNumber);
          if (result.valid) {
            return [group1, group2];
          }
        }
      }
    }

    return null;
  }

  /**
   * Get all combinations of choosing k items from array.
   * @param {any[]} arr
   * @param {number} k
   * @returns {any[][]}
   */
  _getCombinations(arr, k) {
    const results = [];
    
    function combine(start, current) {
      if (current.length === k) {
        results.push([...current]);
        return;
      }
      for (let i = start; i < arr.length; i++) {
        current.push(arr[i]);
        combine(i + 1, current);
        current.pop();
      }
    }
    
    combine(0, []);
    return results;
  }

  /**
   * Apply an action to the game state.
   * @param {PlayerAction} action
   * @returns {boolean} Whether the action was applied successfully
   */
  _applyAction(action) {
    if (!this._state) return false;

    const { newState, valid, error } = processAction(this._state, action);

    if (!valid) {
      if (error) this._board.showMessage(error);
      return false;
    }

    this._state = newState;
    this._updateUI();

    // For online mode: send action or broadcast state
    if (this._session.getMode() === 'online') {
      const sync = this._session.getSync();
      if (sync) {
        if (this._session.isHost()) {
          sync.broadcastState(this._state);
        } else {
          sync.sendAction(action);
        }
      }
    }

    // Log the action
    this._logAction(action);

    return true;
  }

  /**
   * Handle post-discard logic: round end check, turn advancement, AI trigger.
   */
  async _afterDiscard() {
    if (!this._state) return;

    if (isRoundOver(this._state)) {
      await this._endRound();
      return;
    }

    // Advance turn
    this._state = nextTurn(this._state);
    this._updateUI();

    // Save game state
    if (this._session.getMode() === 'ai') {
      saveGame(this._state);
    }

    // Trigger AI turn if next player is AI
    const current = getCurrentPlayer(this._state);
    if (current.isAI) {
      await this._handleAITurn();
    }
  }

  /**
   * Execute AI turn.
   */
  async _handleAITurn() {
    if (!this._state) return;
    this._aiTurnInProgress = true;

    const aiPlayer = getCurrentPlayer(this._state);
    this._board.addLog(`<span class="player-name">${aiPlayer.name}</span> is thinking...`);

    try {
      const actions = await takeTurn(this._state, aiPlayer.id, aiPlayer.difficulty);

      for (const action of actions) {
        const { newState, valid } = processAction(this._state, action);
        if (valid) {
          this._state = newState;
          this._updateUI();
          this._logAction(action);
        }
      }

      // After AI discard, check round end
      this._aiTurnInProgress = false;
      await this._afterDiscard();
    } catch (err) {
      console.error('AI turn error:', err);
      this._aiTurnInProgress = false;
    }
  }

  /**
   * End the current round: score, advance phases, check game over.
   */
  async _endRound() {
    if (!this._state) return;

    // Score remaining hands
    const { state: scoredState, roundScores } = updateScores(this._state);
    this._state = scoredState;

    // Show round scores
    const penalties = this._state.players.map((p, i) => ({
      name: p.name,
      penalty: roundScores[i]
    }));
    this._board.shadowRoot.querySelector('score-board').showRoundSummary(penalties);
    this._board.addLog(`Round ${this._state.round} ended! Penalties: ${penalties.map(p => `${p.name}: +${p.penalty}`).join(', ')}`);

    // Advance phases for players who laid down
    for (const player of this._state.players) {
      if (player.hasLaidDown) {
        this._state = advancePhase(this._state, player.id);
      }
    }

    // Check game over
    if (isGameOver(this._state)) {
      this._endGame();
      return;
    }

    // Deal new round
    this._state = dealNewRound(this._state);
    this._updateUI();

    this._board.showMessage(`Round ${this._state.round} starting!`);

    if (this._session.getMode() === 'ai') {
      saveGame(this._state);
    }

    // If first player is AI, trigger their turn
    const current = getCurrentPlayer(this._state);
    if (current.isAI) {
      await this._handleAITurn();
    }
  }

  /**
   * End the game and record result.
   */
  _endGame() {
    if (!this._state) return;

    this._state = { ...this._state, gameOver: true };
    const winner = getWinner(this._state);
    this._state.winner = winner ? winner.id : null;

    this._board.showMessage(winner ? `${winner.name} wins!` : 'Game Over!', 10000);
    this._board.addLog(`Game Over! ${winner ? winner.name + ' wins!' : 'It\'s a draw!'}`);

    // Record result
    addGameResult({
      id: this._state.id,
      date: new Date().toISOString(),
      players: this._state.players.map(p => ({
        name: p.name,
        score: p.score,
        finalPhase: p.currentPhase
      })),
      winnerId: winner ? winner.name : '',
      rounds: this._state.round,
      phaseList: this._state.phaseList,
      mode: this._state.config.mode,
      difficulty: this._state.config.difficulty
    });

    // Clear saved game
    clearSavedGame();
    this._updateUI();
  }

  /**
   * Push state to UI.
   */
  _updateUI() {
    if (!this._state) return;
    this._board.updateState(this._state);

    // Update undo button
    const localPlayer = this._getLocalPlayer();
    const undoBtn = this._board.shadowRoot.querySelector('[data-testid="btn-undo"]');
    if (undoBtn && localPlayer) {
      undoBtn.disabled = !canUndo(this._state, localPlayer.id);
    }
  }

  /**
   * Log an action to the game log.
   * @param {PlayerAction} action
   */
  _logAction(action) {
    const player = this._state.players.find(p => p.id === action.playerId);
    if (!player) return;
    const name = `<span class="player-name">${player.name}</span>`;

    switch (action.type) {
      case 'draw':
        this._board.addLog(`${name} drew from ${action.payload.source}`);
        break;
      case 'discard':
        if (action.payload.card) {
          const card = action.payload.card;
          const desc = card.type === 'number'
            ? `${card.color} ${card.number}`
            : card.type;
          this._board.addLog(`${name} discarded ${desc}`);
        }
        break;
      case 'laydown':
        break; // Logged separately with phase number
      case 'hit':
        this._board.addLog(`${name} hit a card onto a group`);
        break;
    }
  }

  /**
   * Get local player ID.
   * @returns {string}
   */
  _getLocalPlayerId() {
    return this._board._localPlayerId || (this._state.players.find(p => !p.isAI) || this._state.players[0]).id;
  }

  /**
   * Get local player object.
   * @returns {import('../types.js').Player | undefined}
   */
  _getLocalPlayer() {
    if (!this._state) return undefined;
    const id = this._getLocalPlayerId();
    return this._state.players.find(p => p.id === id);
  }
}
