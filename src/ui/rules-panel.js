/**
 * Phase 10 — Rules Panel Web Component
 * 
 * Overlay panel explaining game rules for new players.
 */

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: block; }
    .overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 16px;
    }
    .overlay[hidden] { display: none; }
    .panel {
      background: #1a1a2e; border-radius: 12px; padding: 24px;
      max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;
      color: #fff;
    }
    h2 { margin: 0 0 16px; color: var(--color-accent, #ffab00); }
    h3 { margin: 16px 0 8px; color: #81d4fa; font-size: 1em; }
    p, li { font-size: 0.9em; line-height: 1.5; color: rgba(255,255,255,0.85); }
    ul { padding-left: 20px; }
    .close-btn {
      position: absolute; top: 16px; right: 16px;
      background: none; border: none; color: #fff; font-size: 1.5em;
      cursor: pointer; padding: 8px;
    }
    .close-btn:focus-visible { outline: 2px solid var(--color-accent); }
    .phase-list { margin: 8px 0; }
    .phase-item { padding: 3px 0; font-size: 0.85em; }
    .phase-num { color: var(--color-accent); font-weight: bold; }
    .scoring-table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    .scoring-table td { padding: 4px 8px; font-size: 0.85em; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .scoring-table td:last-child { text-align: right; color: #ef5350; }
  </style>
  <div class="overlay" hidden role="dialog" aria-label="Game Rules" data-testid="rules-panel">
    <button class="close-btn" aria-label="Close rules" data-testid="rules-close">&times;</button>
    <div class="panel">
      <h2>How to Play Phase 10</h2>
      <h3>Overview</h3>
      <p>Be the first player to complete all 10 Phases. Each Phase requires a specific combination of cards. Complete them in order!</p>

      <h3>Turn Structure</h3>
      <ul>
        <li><strong>Draw</strong> — Take 1 card from the Draw Pile or Discard Pile</li>
        <li><strong>Lay Down Phase</strong> (optional) — If you have the right cards, lay down your current Phase</li>
        <li><strong>Hit</strong> (optional) — After laying down, add cards to any completed Phase on the table</li>
        <li><strong>Discard</strong> — Place 1 card on the Discard Pile to end your turn</li>
      </ul>

      <h3>The 10 Phases</h3>
      <div class="phase-list">
        <div class="phase-item"><span class="phase-num">1.</span> 2 Sets of 3</div>
        <div class="phase-item"><span class="phase-num">2.</span> 1 Set of 3 + 1 Run of 4</div>
        <div class="phase-item"><span class="phase-num">3.</span> 1 Set of 4 + 1 Run of 4</div>
        <div class="phase-item"><span class="phase-num">4.</span> 1 Run of 7</div>
        <div class="phase-item"><span class="phase-num">5.</span> 1 Run of 8</div>
        <div class="phase-item"><span class="phase-num">6.</span> 1 Run of 9</div>
        <div class="phase-item"><span class="phase-num">7.</span> 2 Sets of 4</div>
        <div class="phase-item"><span class="phase-num">8.</span> 7 Cards of 1 Color</div>
        <div class="phase-item"><span class="phase-num">9.</span> 1 Set of 5 + 1 Set of 2</div>
        <div class="phase-item"><span class="phase-num">10.</span> 1 Set of 5 + 1 Set of 3</div>
      </div>

      <h3>Card Types</h3>
      <ul>
        <li><strong>Number Cards (1-12)</strong> — In 4 colors: Red, Blue, Green, Yellow</li>
        <li><strong>Wild Cards</strong> — Can substitute for any number or color</li>
        <li><strong>Skip Cards</strong> — When discarded, the opponent loses their next turn</li>
      </ul>

      <h3>Key Rules</h3>
      <ul>
        <li>A <strong>Set</strong> is cards with the same number (e.g., three 7s)</li>
        <li>A <strong>Run</strong> is consecutive numbers (e.g., 3-4-5-6)</li>
        <li>You must complete your Phase in a single turn (all groups at once)</li>
        <li>If you don't complete your Phase, you try again next round</li>
        <li>The round ends when any player discards their last card</li>
      </ul>

      <h3>Scoring (Lower is Better!)</h3>
      <table class="scoring-table">
        <tr><td>Cards 1-9</td><td>5 points each</td></tr>
        <tr><td>Cards 10-12</td><td>10 points each</td></tr>
        <tr><td>Skip Cards</td><td>15 points each</td></tr>
        <tr><td>Wild Cards</td><td>25 points each</td></tr>
      </table>
      <p>Cards left in your hand at round end are penalty points!</p>
    </div>
  </div>
`;

export class RulesPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._overlay = this.shadowRoot.querySelector('.overlay');
    this._closeBtn = this.shadowRoot.querySelector('[data-testid="rules-close"]');
  }

  connectedCallback() {
    this._closeBtn.addEventListener('click', () => this.hide());
    this._overlay.addEventListener('click', (e) => {
      if (e.target === this._overlay) this.hide();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this._overlay.hidden) this.hide();
    });
  }

  show() {
    this._overlay.hidden = false;
    this._closeBtn.focus();
  }

  hide() {
    this._overlay.hidden = true;
    this.dispatchEvent(new CustomEvent('rules-closed', { bubbles: true, composed: true }));
  }
}

customElements.define('rules-panel', RulesPanel);
