/**
 * Phase 10 — Game Board Web Component
 * 
 * Root game container. Manages screen routing (menu/game/results),
 * holds all child components, and pushes state to children.
 */

import './card-element.js';
import './player-hand.js';
import './phase-display.js';
import './score-board.js';
import './game-log.js';
import './game-menu.js';
import './rules-panel.js';
import './phase-editor.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      position: relative;
    }
    .screen { display: none; width: 100%; height: 100%; }
    .screen.active { display: flex; }

    .game-screen {
      flex-direction: column;
      padding: 12px;
      gap: 10px;
      background: linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%);
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    .side-panel {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 180px;
    }
    .center-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .piles {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .pile {
      width: var(--card-width, 72px);
      height: var(--card-height, 104px);
      border-radius: var(--card-radius, 12px);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.75em;
      font-weight: 600;
      text-align: center;
      transition: all 0.2s ease;
    }
    .pile:hover { transform: scale(1.05); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .pile:focus-visible { outline: 2px solid #6366f1; outline-offset: 3px; }
    .draw-pile {
      background: linear-gradient(135deg, #1e293b, #334155);
      border: 2px solid #475569;
      color: #94a3b8;
    }
    .discard-pile {
      background: rgba(255, 255, 255, 0.03);
      border: 2px dashed rgba(255, 255, 255, 0.15);
      color: #64748b;
      position: relative;
    }
    .discard-pile card-element {
      position: absolute;
      top: 0; left: 0;
    }
    .opponent-area {
      display: flex;
      gap: 3px;
      justify-content: center;
      padding: 8px;
    }
    .opponent-card {
      width: calc(var(--card-width, 72px) * 0.45);
      height: calc(var(--card-height, 104px) * 0.45);
      background: linear-gradient(135deg, #1e293b, #334155);
      border: 1.5px solid #475569;
      border-radius: 6px;
    }
    .table-area {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
      min-height: 70px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      backdrop-filter: blur(4px);
    }
    .laid-group {
      display: flex;
      gap: 3px;
      padding: 6px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.04);
    }
    .laid-group card-element {
      --card-width: 46px;
      --card-height: 66px;
    }
    .turn-indicator {
      text-align: center;
      font-weight: 600;
      padding: 6px 16px;
      border-radius: 20px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      font-size: 0.85em;
      letter-spacing: 0.3px;
    }
    /* Step guide - shows current turn step clearly */
    .step-guide {
      display: flex;
      gap: 6px;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      font-size: 0.78em;
    }
    .step-guide .step {
      padding: 4px 10px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: #64748b;
      transition: all 0.3s;
      font-weight: 500;
    }
    .step-guide .step.active {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    }
    .step-guide .step.done {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .step-guide .step-arrow {
      color: #475569;
      font-size: 0.9em;
    }
    /* Phase ready banner */
    .phase-ready-banner {
      display: none;
      padding: 10px 20px;
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1));
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
      text-align: center;
      animation: glow-pulse 2s ease-in-out infinite;
    }
    .phase-ready-banner.visible {
      display: block;
    }
    .phase-ready-banner .hint {
      font-weight: 400;
      font-size: 0.85em;
      opacity: 0.8;
      margin-top: 4px;
      color: #86efac;
    }
    .hit-mode-banner {
      display: none;
      padding: 8px 16px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1));
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #93c5fd;
      border-radius: 12px;
      font-size: 0.82em;
      font-weight: 600;
      text-align: center;
    }
    .hit-mode-banner.visible { display: block; }
    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .action-btn {
      padding: 10px 18px;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.82em;
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.2px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
    }
    .action-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
      background: rgba(255, 255, 255, 0.08);
      color: #64748b;
    }
    .action-btn:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    .action-btn:focus-visible { outline: 2px solid #6366f1; outline-offset: 3px; }
    .action-btn.secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .action-btn.secondary:not(:disabled):hover {
      background: rgba(255, 255, 255, 0.12);
      color: #f1f5f9;
      box-shadow: none;
    }
    .action-btn.laydown-ready {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #fff;
      animation: glow-pulse 1.5s ease-in-out infinite;
    }
    .action-btn.discard-btn {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: #fff;
    }
    .action-btn.hit-btn {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: #fff;
    }
    .action-btn.hit-btn:not(:disabled):hover {
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    .laid-group.hit-target {
      border: 2px solid #3b82f6;
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
      cursor: pointer;
    }
    .laid-group.hit-target:hover {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
    }
    .bottom-area {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(30, 41, 59, 0.95);
      color: #f1f5f9;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 0.9em;
      z-index: 500;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      animation: slide-up 0.3s ease;
    }
    .toast[hidden] { display: none; }

    @keyframes slide-up {
      from { transform: translateX(-50%) translateY(20px); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes glow-pulse {
      0%, 100% { box-shadow: 0 0 8px rgba(99, 102, 241, 0.2); }
      50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
    }

    @media (min-width: 768px) {
      .game-screen { flex-direction: column; }
      .top-bar { flex-direction: row; }
    }
    @media (max-width: 767px) {
      .side-panel { flex-direction: row; min-width: auto; }
      .top-bar { flex-direction: column; }
    }
    @media (prefers-reduced-motion: reduce) {
      .turn-indicator { animation: none; }
      .toast { animation: none; }
      .phase-ready-banner { animation: none; }
      .action-btn.laydown-ready { animation: none; }
    }
  </style>

  <!-- Menu Screen -->
  <div class="screen menu-screen active" data-testid="screen-menu">
    <game-menu></game-menu>
  </div>

  <!-- Game Screen -->
  <div class="screen game-screen" data-testid="screen-game">
    <div class="top-bar">
      <div class="side-panel">
        <phase-display></phase-display>
        <score-board></score-board>
      </div>
      <div class="center-area">
        <div class="opponent-area" data-testid="opponent-area" aria-label="Opponent's cards"></div>
        <div class="table-area" data-testid="table-area" aria-label="Laid-down phases"></div>
        <div class="piles">
          <div class="pile draw-pile" role="button" tabindex="0" aria-label="Draw pile" data-testid="draw-pile">Draw</div>
          <div class="pile discard-pile" role="button" tabindex="0" aria-label="Discard pile" data-testid="discard-pile">Discard</div>
        </div>
        <div class="turn-indicator" data-testid="turn-indicator"></div>
        <div class="step-guide" data-testid="step-guide">
          <span class="step" data-step="draw">1. Draw</span>
          <span class="step-arrow">→</span>
          <span class="step" data-step="laydown">2. Lay Down (optional)</span>
          <span class="step-arrow">→</span>
          <span class="step" data-step="discard">3. Discard</span>
        </div>
        <div class="phase-ready-banner" data-testid="phase-ready-banner">
          You can LAY DOWN your phase now!
          <div class="hint">Select your cards, then press "Lay Down Phase"</div>
        </div>
        <div class="hit-mode-banner" data-testid="hit-mode-banner">
          HIT MODE: Select 1 card, then click a group on the table to add it there
        </div>
      </div>
      <div class="side-panel">
        <game-log></game-log>
      </div>
    </div>
    <div class="bottom-area">
      <div class="action-buttons" data-testid="action-buttons">
        <button class="action-btn" data-testid="btn-laydown" disabled>Lay Down Phase</button>
        <button class="action-btn hit-btn" data-testid="btn-hit" disabled>Hit (add to phase)</button>
        <button class="action-btn discard-btn" data-testid="btn-discard" disabled>Discard Selected</button>
        <button class="action-btn secondary" data-testid="btn-undo" disabled>Undo</button>
        <button class="action-btn secondary" data-testid="btn-menu">Menu</button>
      </div>
      <player-hand></player-hand>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" hidden data-testid="toast"></div>

  <!-- Overlays -->
  <rules-panel></rules-panel>
  <phase-editor></phase-editor>
`;

export class GameBoard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Screen references
    this._menuScreen = this.shadowRoot.querySelector('.menu-screen');
    this._gameScreen = this.shadowRoot.querySelector('.game-screen');

    // Component references
    this._menu = this.shadowRoot.querySelector('game-menu');
    this._playerHand = this.shadowRoot.querySelector('player-hand');
    this._phaseDisplay = this.shadowRoot.querySelector('phase-display');
    this._scoreBoard = this.shadowRoot.querySelector('score-board');
    this._gameLog = this.shadowRoot.querySelector('game-log');
    this._rulesPanel = this.shadowRoot.querySelector('rules-panel');
    this._phaseEditor = this.shadowRoot.querySelector('phase-editor');
    this._turnIndicator = this.shadowRoot.querySelector('[data-testid="turn-indicator"]');
    this._opponentArea = this.shadowRoot.querySelector('[data-testid="opponent-area"]');
    this._tableArea = this.shadowRoot.querySelector('[data-testid="table-area"]');
    this._drawPile = this.shadowRoot.querySelector('[data-testid="draw-pile"]');
    this._discardPile = this.shadowRoot.querySelector('[data-testid="discard-pile"]');
    this._toast = this.shadowRoot.querySelector('[data-testid="toast"]');
  }

  connectedCallback() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'h' || e.key === '?') this._rulesPanel.show();
      if (e.key === 'u') this._emitAction('undo');
    });

    // Menu button
    this.shadowRoot.querySelector('[data-testid="btn-menu"]')
      .addEventListener('click', () => this.showScreen('menu'));

    // Rules button from menu
    this._menu.addEventListener('open-rules', () => this._rulesPanel.show());
  }

  /**
   * Switch between screens.
   * @param {'menu' | 'game'} screen
   */
  showScreen(screen) {
    this._menuScreen.classList.toggle('active', screen === 'menu');
    this._gameScreen.classList.toggle('active', screen === 'game');
  }

  /**
   * Push game state to all child components.
   * @param {import('../types.js').GameState} state
   */
  updateState(state) {
    const currentPlayer = state.players[state.currentPlayerIndex];

    // Update player hand
    const localPlayer = state.players.find(p => !p.isAI) || state.players[0];
    this._playerHand.setCards(localPlayer.hand);
    this._playerHand.setDisabled(currentPlayer.id !== localPlayer.id);

    // Update phase display
    this._phaseDisplay.update(state.players, state.phaseList);

    // Update scores
    this._scoreBoard.update(state.players);

    // Update turn indicator
    this._turnIndicator.textContent = `${currentPlayer.name}'s Turn — ${state.turnPhase.toUpperCase()}`;

    // Update step guide
    this._updateStepGuide(state, localPlayer);

    // Update phase-ready banner
    this._updatePhaseReadyBanner(state, localPlayer);

    // Update action buttons state
    this._updateActionButtons(state, localPlayer);

    // Update opponent area
    const opponent = state.players.find(p => p.id !== localPlayer.id);
    this._renderOpponent(opponent);

    // Update table area (laid-down groups)
    this._renderTable(state);

    // Update discard pile top card
    this._renderDiscardPile(state);

    // Update draw pile count
    this._drawPile.textContent = `Draw\n(${state.drawPile.length})`;
    this._drawPile.setAttribute('aria-label', `Draw pile, ${state.drawPile.length} cards`);
  }

  /**
   * Show a toast notification.
   * @param {string} text
   * @param {number} duration
   */
  showMessage(text, duration = 3000) {
    this._toast.textContent = text;
    this._toast.hidden = false;
    setTimeout(() => { this._toast.hidden = true; }, duration);
  }

  /**
   * Add an entry to the game log.
   * @param {string} message
   */
  addLog(message) {
    this._gameLog.addEntry(message);
  }

  /** @returns {import('./game-menu.js').GameMenu} */
  get menu() { return this._menu; }
  /** @returns {import('./player-hand.js').PlayerHand} */
  get playerHand() { return this._playerHand; }
  /** @returns {HTMLElement} */
  get drawPileEl() { return this._drawPile; }
  /** @returns {HTMLElement} */
  get discardPileEl() { return this._discardPile; }
  /** @returns {import('./rules-panel.js').RulesPanel} */
  get rulesPanel() { return this._rulesPanel; }
  /** @returns {import('./phase-editor.js').PhaseEditor} */
  get phaseEditor() { return this._phaseEditor; }

  /**
   * Enable/disable hit mode (highlights table groups as targets).
   * @param {boolean} enabled
   */
  setHitMode(enabled) {
    const groups = this._tableArea.querySelectorAll('.laid-group');
    groups.forEach(g => g.classList.toggle('hit-target', enabled));
    const banner = this.shadowRoot.querySelector('[data-testid="hit-mode-banner"]');
    banner.classList.toggle('visible', enabled);
  }

  _updateStepGuide(state, localPlayer) {
    const guide = this.shadowRoot.querySelector('[data-testid="step-guide"]');
    const steps = guide.querySelectorAll('.step');
    const isMyTurn = state.players[state.currentPlayerIndex].id === localPlayer.id;

    steps.forEach(s => { s.classList.remove('active', 'done'); });

    if (!isMyTurn) {
      // Not my turn - dim everything
      guide.style.opacity = '0.4';
      return;
    }
    guide.style.opacity = '1';

    if (state.turnPhase === 'draw') {
      steps[0].classList.add('active');
    } else if (state.turnPhase === 'action') {
      steps[0].classList.add('done');
      steps[1].classList.add('active');
    } else if (state.turnPhase === 'discard') {
      steps[0].classList.add('done');
      steps[1].classList.add('done');
      steps[2].classList.add('active');
    }
  }

  _updatePhaseReadyBanner(state, localPlayer) {
    const banner = this.shadowRoot.querySelector('[data-testid="phase-ready-banner"]');
    const isMyTurn = state.players[state.currentPlayerIndex].id === localPlayer.id;
    const canLayDown = isMyTurn && state.turnPhase === 'action' && !localPlayer.hasLaidDown;

    banner.classList.toggle('visible', canLayDown);
  }

  _updateActionButtons(state, localPlayer) {
    const isMyTurn = state.players[state.currentPlayerIndex].id === localPlayer.id;
    const laydownBtn = this.shadowRoot.querySelector('[data-testid="btn-laydown"]');
    const discardBtn = this.shadowRoot.querySelector('[data-testid="btn-discard"]');
    const hitBtn = this.shadowRoot.querySelector('[data-testid="btn-hit"]');

    // Lay Down button: enabled during action phase if player hasn't laid down yet
    const canLayDown = isMyTurn && state.turnPhase === 'action' && !localPlayer.hasLaidDown;
    laydownBtn.disabled = !canLayDown;
    laydownBtn.classList.toggle('laydown-ready', canLayDown);

    // Hit button: enabled during action phase if player HAS laid down (can hit on groups)
    const canHitNow = isMyTurn && state.turnPhase === 'action' && localPlayer.hasLaidDown;
    hitBtn.disabled = !canHitNow;

    // Discard button: enabled during action phase (player must discard to end turn)
    const canDiscard = isMyTurn && state.turnPhase === 'action';
    discardBtn.disabled = !canDiscard;
  }

  _renderOpponent(opponent) {
    if (!opponent) return;
    this._opponentArea.innerHTML = '';
    for (let i = 0; i < opponent.hand.length; i++) {
      const div = document.createElement('div');
      div.className = 'opponent-card';
      div.setAttribute('aria-hidden', 'true');
      this._opponentArea.appendChild(div);
    }
    this._opponentArea.setAttribute('aria-label', `${opponent.name}: ${opponent.hand.length} cards`);
  }

  _renderTable(state) {
    this._tableArea.innerHTML = '';
    for (const player of state.players) {
      if (player.laidDownGroups.length === 0) continue;
      for (let gi = 0; gi < player.laidDownGroups.length; gi++) {
        const group = player.laidDownGroups[gi];
        const groupEl = document.createElement('div');
        groupEl.className = 'laid-group';
        groupEl.setAttribute('aria-label', `${player.name}'s phase group ${gi + 1}`);
        groupEl.setAttribute('data-player-id', player.id);
        groupEl.setAttribute('data-group-index', gi);
        
        for (const card of group) {
          const cardEl = document.createElement('card-element');
          cardEl.setCard(card);
          groupEl.appendChild(cardEl);
        }

        // Click handler for hitting
        groupEl.addEventListener('click', () => {
          this.dispatchEvent(new CustomEvent('hit-group-click', {
            bubbles: true, composed: true,
            detail: { targetPlayerId: player.id, targetGroupIndex: gi }
          }));
        });

        this._tableArea.appendChild(groupEl);
      }
    }
  }

  _renderDiscardPile(state) {
    this._discardPile.innerHTML = '';
    if (state.discardPile.length > 0) {
      const topCard = state.discardPile[state.discardPile.length - 1];
      const cardEl = document.createElement('card-element');
      cardEl.setCard(topCard);
      this._discardPile.appendChild(cardEl);
      this._discardPile.setAttribute('aria-label',
        `Discard pile, top card: ${topCard.type === 'number' ? `${topCard.color} ${topCard.number}` : topCard.type}`);
    } else {
      this._discardPile.textContent = 'Discard';
      this._discardPile.setAttribute('aria-label', 'Discard pile, empty');
    }
  }

  _emitAction(action) {
    this.dispatchEvent(new CustomEvent('game-action', {
      bubbles: true, composed: true, detail: { action }
    }));
  }
}

customElements.define('game-board', GameBoard);
