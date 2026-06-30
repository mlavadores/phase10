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
      height: 100%;
    }
    .log-container {
      padding: 10px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      height: 100%;
      min-height: 60px;
      max-height: 100%;
      overflow-y: auto;
      box-sizing: border-box;
    }
    h3 {
      margin: 0 0 6px;
      font-size: 0.65em;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 600;
    }
    .log-entry {
      font-size: 0.72em;
      padding: 3px 0;
      color: #94a3b8;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      line-height: 1.4;
    }
    .log-entry:last-child {
      border-bottom: none;
    }
    .log-entry .player-name {
      font-weight: 600;
      color: #a5b4fc;
    }
    .empty-msg {
      font-size: 0.7em;
      color: #334155;
      font-style: italic;
    }
    @media (max-width: 900px) {
      .log-container {
        min-height: 50px;
        max-height: 70px;
        padding: 6px 8px;
      }
      h3 { font-size: 0.6em; margin-bottom: 4px; }
      .log-entry { font-size: 0.65em; padding: 2px 0; }
    }
  </style>
  <div class="log-container" role="log" aria-label="Game actions" aria-live="polite" data-testid="game-log">
    <h3>Game Log</h3>
    <div class="log-list"><span class="empty-msg">Waiting for actions...</span></div>
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
