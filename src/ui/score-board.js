/**
 * Phase 10 — Score Board Web Component
 * 
 * Displays running scores and round-end summaries.
 */

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .score-container {
      padding: 0;
    }
    .score-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2px 0;
      font-size: 0.75em;
    }
    .score-name {
      font-weight: 600;
      color: #e2e8f0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 80px;
    }
    .score-value {
      font-size: 1em;
      color: #a5b4fc;
      font-weight: 700;
      white-space: nowrap;
    }
    .round-summary {
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 0.7em;
      color: #94a3b8;
    }
    .round-penalty {
      color: #f87171;
    }
    h3 {
      display: none;
    }
  </style>
  <div class="score-container" role="region" aria-label="Scores" data-testid="score-board">
    <h3>Scores</h3>
    <div class="score-list"></div>
    <div class="round-summary" hidden></div>
  </div>
`;

export class ScoreBoard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._list = this.shadowRoot.querySelector('.score-list');
    this._summary = this.shadowRoot.querySelector('.round-summary');
  }

  /**
   * Update score display.
   * @param {import('../types.js').Player[]} players
   */
  update(players) {
    this._list.innerHTML = '';
    for (const player of players) {
      const row = document.createElement('div');
      row.className = 'score-row';
      row.innerHTML = `
        <span class="score-name">${player.name}</span>
        <span class="score-value">${player.score} pts</span>
      `;
      this._list.appendChild(row);
    }
  }

  /**
   * Show round-end penalty summary.
   * @param {Array<{name: string, penalty: number}>} penalties
   */
  showRoundSummary(penalties) {
    this._summary.hidden = false;
    this._summary.innerHTML = '<strong>Round Penalties:</strong><br>' +
      penalties.map(p => `${p.name}: <span class="round-penalty">+${p.penalty}</span>`).join('<br>');
  }

  /**
   * Hide round summary.
   */
  hideRoundSummary() {
    this._summary.hidden = true;
  }
}

customElements.define('score-board', ScoreBoard);
