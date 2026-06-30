/**
 * Phase 10 — Game Board Web Component
 * 
 * Root game container. Full-viewport CSS Grid layout.
 * No scrollbars — everything fits in the screen.
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
    .screen.active { display: grid; }

    /* === GAME LAYOUT: 3-row grid === */
    .game-screen {
      grid-template-rows: auto 1fr auto;
      grid-template-columns: 1fr;
      height: 100vh;
      padding: 0;
      background: linear-gradient(160deg, #0f0f23 0%, #1a1a3e 40%, #0f172a 100%);
    }

    /* --- TOP BAR: opponent info + game status --- */
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.3);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      gap: 12px;
    }
    .top-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .opponent-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .opponent-cards {
      display: flex;
      gap: 2px;
    }
    .opponent-card {
      width: 18px;
      height: 26px;
      background: linear-gradient(135deg, #334155, #475569);
      border: 1px solid #64748b;
      border-radius: 3px;
    }
    .opponent-label {
      font-size: 0.75em;
      color: #94a3b8;
    }
    .top-center {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .turn-badge {
      padding: 4px 12px;
      border-radius: 16px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      font-size: 0.75em;
      font-weight: 600;
      white-space: nowrap;
    }
    .step-guide {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .step-guide .step {
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.04);
      color: #475569;
      font-size: 0.7em;
      font-weight: 500;
      transition: all 0.2s;
    }
    .step-guide .step.active {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      font-weight: 600;
    }
    .step-guide .step.done {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
    }
    .step-guide .arrow { color: #334155; font-size: 0.7em; }
    .top-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .info-chip {
      padding: 4px 10px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.7em;
      color: #94a3b8;
    }
    .info-chip strong { color: #e2e8f0; }

    /* --- MIDDLE: game area (table + piles) --- */
    .game-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 12px;
      position: relative;
    }
    .table-area {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
      padding: 10px 16px;
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      min-height: 46px;
    }
    .table-area:empty::after {
      content: 'No phases laid down yet';
      color: #334155;
      font-size: 0.75em;
    }
    .laid-group {
      display: flex;
      gap: 2px;
      padding: 3px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.03);
    }
    .laid-group card-element {
      --card-width: 40px;
      --card-height: 56px;
    }
    .laid-group.hit-target {
      border-color: #3b82f6;
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
      cursor: pointer;
    }
    .piles-row {
      display: flex;
      gap: 24px;
      align-items: center;
    }
    .pile {
      width: 50px;
      height: 70px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.65em;
      font-weight: 600;
      text-align: center;
      transition: all 0.15s ease;
    }
    .pile:hover { transform: scale(1.08); }
    .pile:focus-visible { outline: 2px solid #6366f1; outline-offset: 3px; }
    .draw-pile {
      background: linear-gradient(135deg, #1e293b, #334155);
      border: 2px solid #475569;
      color: #64748b;
    }
    .discard-pile {
      background: rgba(255, 255, 255, 0.03);
      border: 2px dashed rgba(255, 255, 255, 0.12);
      color: #475569;
      position: relative;
    }
    .discard-pile card-element {
      position: absolute;
      top: 0; left: 0;
      --card-width: 50px;
      --card-height: 70px;
    }
    /* Banners */
    .banner-area {
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
    }
    .phase-ready-banner, .hit-mode-banner {
      display: none;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.75em;
      font-weight: 600;
      text-align: center;
      white-space: nowrap;
    }
    .phase-ready-banner {
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;
    }
    .phase-ready-banner.visible, .hit-mode-banner.visible { display: block; }
    .phase-ready-banner .hint { display: none; }
    .hit-mode-banner {
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #93c5fd;
    }

    /* --- BOTTOM: hand + action buttons --- */
    .bottom-bar {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px 16px 12px;
      background: rgba(0, 0, 0, 0.25);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .actions-row {
      display: flex;
      gap: 6px;
      justify-content: center;
      align-items: center;
    }
    .action-btn {
      padding: 7px 14px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.72em;
      cursor: pointer;
      transition: all 0.15s ease;
      letter-spacing: 0.2px;
      white-space: nowrap;
    }
    .action-btn:disabled {
      opacity: 0.25;
      cursor: default;
      transform: none;
      background: rgba(255, 255, 255, 0.05);
      color: #475569;
    }
    .action-btn:not(:disabled):hover { transform: translateY(-1px); }
    .action-btn:focus-visible { outline: 2px solid #6366f1; outline-offset: 2px; }
    .action-btn.primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .action-btn.success { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; }
    .action-btn.danger { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; }
    .action-btn.info { background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; }
    .action-btn.ghost {
      background: rgba(255, 255, 255, 0.06);
      color: #64748b;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .action-btn.ghost:not(:disabled):hover { color: #e2e8f0; background: rgba(255, 255, 255, 0.1); }
    .action-btn.laydown-ready {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #fff;
      box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.95);
      color: #f1f5f9;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 0.8em;
      z-index: 500;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      animation: slide-up 0.25s ease;
    }
    .toast[hidden] { display: none; }

    @keyframes slide-up {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @media (max-width: 767px) {
      .top-bar { padding: 6px 8px; }
      .step-guide { display: none; }
      .game-area { padding: 8px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .toast { animation: none; }
    }
  </style>

  <!-- Menu Screen -->
  <div class="screen menu-screen active" data-testid="screen-menu">
    <game-menu></game-menu>
  </div>

  <!-- Game Screen -->
  <div class="screen game-screen" data-testid="screen-game">

    <!-- TOP BAR -->
    <div class="top-bar">
      <div class="top-left">
        <phase-display></phase-display>
      </div>
      <div class="top-center">
        <div class="turn-badge" data-testid="turn-indicator"></div>
        <div class="step-guide" data-testid="step-guide">
          <span class="step" data-step="draw">Draw</span>
          <span class="arrow">›</span>
          <span class="step" data-step="laydown">Lay Down</span>
          <span class="arrow">›</span>
          <span class="step" data-step="discard">Discard</span>
        </div>
      </div>
      <div class="top-right">
        <div class="opponent-info">
          <span class="opponent-label" data-testid="opponent-label">Opponent</span>
          <div class="opponent-cards" data-testid="opponent-area"></div>
        </div>
        <score-board></score-board>
      </div>
    </div>

    <!-- GAME AREA -->
    <div class="game-area">
      <div class="banner-area">
        <div class="phase-ready-banner" data-testid="phase-ready-banner">Ready to lay down your phase!</div>
        <div class="hit-mode-banner" data-testid="hit-mode-banner">Select 1 card, then click a group on the table</div>
      </div>
      <div class="table-area" data-testid="table-area" aria-label="Laid-down phases"></div>
      <div class="piles-row">
        <div class="pile draw-pile" role="button" tabindex="0" aria-label="Draw pile" data-testid="draw-pile">Draw</div>
        <div class="pile discard-pile" role="button" tabindex="0" aria-label="Discard pile" data-testid="discard-pile"></div>
      </div>
    </div>

    <!-- BOTTOM BAR -->
    <div class="bottom-bar">
      <div class="actions-row" data-testid="action-buttons">
        <button class="action-btn success" data-testid="btn-laydown" disabled>Lay Down</button>
        <button class="action-btn info" data-testid="btn-hit" disabled>Hit</button>
        <button class="action-btn danger" data-testid="btn-discard" disabled>Discard</button>
        <button class="action-btn ghost" data-testid="btn-undo" disabled>Undo</button>
        <button class="action-btn ghost" data-testid="btn-menu">Menu</button>
      </div>
      <player-hand></player-hand>
    </div>

  </div>

  <!-- Toast -->
  <div class="toast" hidden data-testid="toast"></div>

  <!-- Overlays -->
  <rules-panel></rules-panel>
  <phase-editor></phase-editor>
  <game-log style="display:none"></game-log>
`;

export class GameBoard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._menuScreen = this.shadowRoot.querySelector('.menu-screen');
    this._gameScreen = this.shadowRoot.querySelector('.game-screen');
    this._menu = this.shadowRoot.querySelector('game-menu');
    this._playerHand = this.shadowRoot.querySelector('player-hand');
    this._phaseDisplay = this.shadowRoot.querySelector('phase-display');
    this._scoreBoard = this.shadowRoot.querySelector('score-board');
    this._gameLog = this.shadowRoot.querySelector('game-log');
    this._rulesPanel = this.shadowRoot.querySelector('rules-panel');
    this._phaseEditor = this.shadowRoot.querySelector('phase-editor');
    this._turnIndicator = this.shadowRoot.querySelector('[data-testid="turn-indicator"]');
    this._opponentArea = this.shadowRoot.querySelector('[data-testid="opponent-area"]');
    this._opponentLabel = this.shadowRoot.querySelector('[data-testid="opponent-label"]');
    this._tableArea = this.shadowRoot.querySelector('[data-testid="table-area"]');
    this._drawPile = this.shadowRoot.querySelector('[data-testid="draw-pile"]');
    this._discardPile = this.shadowRoot.querySelector('[data-testid="discard-pile"]');
    this._toast = this.shadowRoot.querySelector('[data-testid="toast"]');
  }

  connectedCallback() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'h' || e.key === '?') this._rulesPanel.show();
      if (e.key === 'u') this._emitAction('undo');
    });
    this.shadowRoot.querySelector('[data-testid="btn-menu"]')
      .addEventListener('click', () => this.showScreen('menu'));
    this._menu.addEventListener('open-rules', () => this._rulesPanel.show());
  }

  showScreen(screen) {
    this._menuScreen.classList.toggle('active', screen === 'menu');
    this._gameScreen.classList.toggle('active', screen === 'game');
  }

  updateState(state) {
    const currentPlayer = state.players[state.currentPlayerIndex];
    const localPlayer = state.players.find(p => !p.isAI) || state.players[0];
    const opponent = state.players.find(p => p.id !== localPlayer.id);

    this._playerHand.setCards(localPlayer.hand);
    this._playerHand.setDisabled(currentPlayer.id !== localPlayer.id);
    this._phaseDisplay.update(state.players, state.phaseList);
    this._scoreBoard.update(state.players);
    this._turnIndicator.textContent = `${currentPlayer.name} — ${state.turnPhase.toUpperCase()}`;
    this._updateStepGuide(state, localPlayer);
    this._updatePhaseReadyBanner(state, localPlayer);
    this._updateActionButtons(state, localPlayer);
    this._renderOpponent(opponent);
    this._renderTable(state);
    this._renderDiscardPile(state);
    this._drawPile.textContent = `Draw (${state.drawPile.length})`;
    this._drawPile.setAttribute('aria-label', `Draw pile, ${state.drawPile.length} cards`);
  }

  showMessage(text, duration = 3000) {
    this._toast.textContent = text;
    this._toast.hidden = false;
    setTimeout(() => { this._toast.hidden = true; }, duration);
  }

  addLog(message) { this._gameLog.addEntry(message); }
  get menu() { return this._menu; }
  get playerHand() { return this._playerHand; }
  get drawPileEl() { return this._drawPile; }
  get discardPileEl() { return this._discardPile; }
  get rulesPanel() { return this._rulesPanel; }
  get phaseEditor() { return this._phaseEditor; }

  setHitMode(enabled) {
    const groups = this._tableArea.querySelectorAll('.laid-group');
    groups.forEach(g => g.classList.toggle('hit-target', enabled));
    this.shadowRoot.querySelector('[data-testid="hit-mode-banner"]').classList.toggle('visible', enabled);
  }

  _updateStepGuide(state, localPlayer) {
    const guide = this.shadowRoot.querySelector('[data-testid="step-guide"]');
    const steps = guide.querySelectorAll('.step');
    const isMyTurn = state.players[state.currentPlayerIndex].id === localPlayer.id;
    steps.forEach(s => s.classList.remove('active', 'done'));
    if (!isMyTurn) { guide.style.opacity = '0.3'; return; }
    guide.style.opacity = '1';
    if (state.turnPhase === 'draw') steps[0].classList.add('active');
    else if (state.turnPhase === 'action') { steps[0].classList.add('done'); steps[1].classList.add('active'); }
    else { steps[0].classList.add('done'); steps[1].classList.add('done'); steps[2].classList.add('active'); }
  }

  _updatePhaseReadyBanner(state, localPlayer) {
    const banner = this.shadowRoot.querySelector('[data-testid="phase-ready-banner"]');
    const isMyTurn = state.players[state.currentPlayerIndex].id === localPlayer.id;
    banner.classList.toggle('visible', isMyTurn && state.turnPhase === 'action' && !localPlayer.hasLaidDown);
  }

  _updateActionButtons(state, localPlayer) {
    const isMyTurn = state.players[state.currentPlayerIndex].id === localPlayer.id;
    const laydownBtn = this.shadowRoot.querySelector('[data-testid="btn-laydown"]');
    const discardBtn = this.shadowRoot.querySelector('[data-testid="btn-discard"]');
    const hitBtn = this.shadowRoot.querySelector('[data-testid="btn-hit"]');
    const canLayDown = isMyTurn && state.turnPhase === 'action' && !localPlayer.hasLaidDown;
    laydownBtn.disabled = !canLayDown;
    laydownBtn.classList.toggle('laydown-ready', canLayDown);
    hitBtn.disabled = !(isMyTurn && state.turnPhase === 'action' && localPlayer.hasLaidDown);
    discardBtn.disabled = !(isMyTurn && state.turnPhase === 'action');
  }

  _renderOpponent(opponent) {
    if (!opponent) return;
    this._opponentArea.innerHTML = '';
    this._opponentLabel.textContent = `${opponent.name} (${opponent.hand.length})`;
    for (let i = 0; i < Math.min(opponent.hand.length, 12); i++) {
      const div = document.createElement('div');
      div.className = 'opponent-card';
      this._opponentArea.appendChild(div);
    }
  }

  _renderTable(state) {
    this._tableArea.innerHTML = '';
    for (const player of state.players) {
      if (player.laidDownGroups.length === 0) continue;
      for (let gi = 0; gi < player.laidDownGroups.length; gi++) {
        const group = player.laidDownGroups[gi];
        const groupEl = document.createElement('div');
        groupEl.className = 'laid-group';
        groupEl.setAttribute('data-player-id', player.id);
        groupEl.setAttribute('data-group-index', gi);
        for (const card of group) {
          const cardEl = document.createElement('card-element');
          cardEl.setCard(card);
          groupEl.appendChild(cardEl);
        }
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
    }
  }

  _emitAction(action) {
    this.dispatchEvent(new CustomEvent('game-action', { bubbles: true, composed: true, detail: { action } }));
  }
}

customElements.define('game-board', GameBoard);
