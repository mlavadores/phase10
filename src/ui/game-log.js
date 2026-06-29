/**
 * Phase 10 — Game Log Web Component
 * 
 * Scrollable feed of recent game actions.
 */

const MAX_ENTRIES = 20;

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .log-container {
      padding: 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      max-height: 160px;
      overflow-y: auto;
      backdrop-filter: blur(4px);
    }
    h3 {
      margin: 0 0 8px;
      font-size: 0.7em;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 600;
    }
    .log-entry {
      font-size: 0.75em;
      padding: 3px 0;
      color: #94a3b8;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      animation: fade-in 0.3s ease;
    }
    .log-entry:last-child {
      border-bottom: none;
    }
    .log-entry .player-name {
      font-weight: 600;
      color: #a5b4fc;
    }
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .log-entry { animation: none; }
    }
  </style>
  <div class="log-container" role="log" aria-label="Game actions" aria-live="polite" data-testid="game-log">
    <h3>Game Log</h3>
    <div class="log-list"></div>
  </div>
`;

export class GameLog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._list = this.shadowRoot.querySelector('.log-list');
    /** @type {string[]} */
    this._entries = [];
  }

  /**
   * Add a log entry.
   * @param {string} message - Log message (can contain HTML)
   */
  addEntry(message) {
    this._entries.unshift(message);
    if (this._entries.length > MAX_ENTRIES) {
      this._entries.length = MAX_ENTRIES;
    }
    this._render();
  }

  /**
   * Clear all log entries.
   */
  clear() {
    this._entries = [];
    this._render();
  }

  _render() {
    this._list.innerHTML = this._entries
      .map(msg => `<div class="log-entry">${msg}</div>`)
      .join('');
  }
}

customElements.define('game-log', GameLog);
