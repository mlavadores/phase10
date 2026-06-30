/**
 * Phase 10 — Game Menu Web Component
 * 
 * Main menu, game mode selection, name entry, settings.
 */

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: block; width: 100%; height: 100%; }
    .menu-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 24px;
      text-align: center;
    }
    h1 {
      font-size: 3em;
      margin: 0 0 4px;
      background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 800;
      letter-spacing: -1px;
    }
    .subtitle { font-size: 1em; color: var(--color-text-muted, #94a3b8); margin-bottom: 40px; font-weight: 300; }
    .menu-buttons { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 320px; }
    .btn {
      padding: 14px 28px;
      font-size: 0.95em;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.3px;
    }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
    .btn:active { transform: translateY(0); }
    .btn:focus-visible { outline: 2px solid #6366f1; outline-offset: 3px; }
    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }
    .btn-primary:hover { box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6); }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #f1f5f9;
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.25); }
    .btn-outline {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: var(--color-text-muted, #94a3b8);
    }
    .btn-outline:hover { border-color: rgba(255, 255, 255, 0.4); color: #fff; }
    .setup-screen { display: none; flex-direction: column; align-items: center; gap: 16px; width: 100%; max-width: 320px; }
    .setup-screen.active { display: flex; }
    h2 { margin: 0 0 8px; font-size: 1.4em; font-weight: 700; color: #f1f5f9; }
    label { font-size: 0.85em; color: var(--color-text-muted, #94a3b8); align-self: flex-start; font-weight: 500; }
    input, select {
      width: 100%;
      padding: 12px 16px;
      font-size: 1em;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.06);
      color: #f1f5f9;
      backdrop-filter: blur(4px);
      transition: border-color 0.2s;
      box-sizing: border-box;
      -webkit-appearance: none;
      appearance: none;
    }
    input::placeholder { color: rgba(255, 255, 255, 0.3); }
    input:focus, select:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); }
    select option { background: #1e293b; color: #f1f5f9; }
    .back-btn {
      align-self: flex-start;
      background: none;
      border: none;
      color: var(--color-text-muted, #94a3b8);
      cursor: pointer;
      font-size: 0.9em;
      padding: 4px;
      transition: color 0.2s;
    }
    .back-btn:hover { color: #fff; }
    .room-code-display { text-align: center; }
    .room-code {
      display: inline-block;
      padding: 8px 16px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.1em;
      color: #a5b4fc;
      letter-spacing: 1px;
    }
    @media (prefers-reduced-motion: reduce) { .btn { transition: none; } }
  </style>
  <div class="menu-container" data-testid="game-menu">
    <div class="main-menu">
      <h1>Phase 10</h1>
      <p class="subtitle">The Classic Card Game</p>
      <div class="menu-buttons">
        <button class="btn btn-primary" data-testid="menu-play-ai">Play vs AI</button>
        <button class="btn btn-secondary" data-testid="menu-host-online">Host Online Game</button>
        <button class="btn btn-secondary" data-testid="menu-join-online">Join Online Game</button>
        <button class="btn btn-outline" data-testid="menu-resume" hidden>Resume Game</button>
        <button class="btn btn-outline" data-testid="menu-rules">Rules</button>
      </div>
    </div>
    <div class="setup-screen" id="ai-setup">
      <button class="back-btn" data-action="back">&larr; Back</button>
      <h2>Play vs AI</h2>
      <label for="player-name">Your Name</label>
      <input id="player-name" type="text" placeholder="Enter your name" maxlength="20" data-testid="input-player-name">
      <label for="difficulty">Difficulty</label>
      <select id="difficulty" data-testid="select-difficulty">
        <option value="easy">Easy</option>
        <option value="hard">Hard</option>
      </select>
      <button class="btn btn-primary" data-testid="btn-start-ai">Start Game</button>
    </div>
    <div class="setup-screen" id="host-setup">
      <button class="back-btn" data-action="back">&larr; Back</button>
      <h2>Host Online Game</h2>
      <label for="host-name">Your Name</label>
      <input id="host-name" type="text" placeholder="Enter your name" maxlength="20" data-testid="input-host-name">
      <button class="btn btn-primary" data-testid="btn-create-room">Create Room</button>
      <div class="room-code-display" hidden>
        <p>Share this code with your friend:</p>
        <strong class="room-code" data-testid="room-code"></strong>
        <p style="font-size:0.8em;color:rgba(255,255,255,0.6)">Waiting for opponent...</p>
      </div>
    </div>
    <div class="setup-screen" id="join-setup">
      <button class="back-btn" data-action="back">&larr; Back</button>
      <h2>Join Online Game</h2>
      <label for="join-name">Your Name</label>
      <input id="join-name" type="text" placeholder="Enter your name" maxlength="20" data-testid="input-join-name">
      <label for="room-input">Room Code</label>
      <input id="room-input" type="text" placeholder="Paste room code" data-testid="input-room-code">
      <button class="btn btn-primary" data-testid="btn-join-room">Join</button>
    </div>
  </div>
`;

export class GameMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._mainMenu = this.shadowRoot.querySelector('.main-menu');
    this._aiSetup = this.shadowRoot.querySelector('#ai-setup');
    this._hostSetup = this.shadowRoot.querySelector('#host-setup');
    this._joinSetup = this.shadowRoot.querySelector('#join-setup');
  }

  connectedCallback() {
    // Main menu buttons
    this.shadowRoot.querySelector('[data-testid="menu-play-ai"]')
      .addEventListener('click', () => this._showScreen('ai'));
    this.shadowRoot.querySelector('[data-testid="menu-host-online"]')
      .addEventListener('click', () => this._showScreen('host'));
    this.shadowRoot.querySelector('[data-testid="menu-join-online"]')
      .addEventListener('click', () => this._showScreen('join'));
    this.shadowRoot.querySelector('[data-testid="menu-resume"]')
      .addEventListener('click', () => this._emit('resume-game', {}));
    this.shadowRoot.querySelector('[data-testid="menu-rules"]')
      .addEventListener('click', () => this._emit('open-rules', {}));

    // Back buttons
    this.shadowRoot.querySelectorAll('[data-action="back"]').forEach(btn => {
      btn.addEventListener('click', () => this._showScreen('main'));
    });

    // Start AI game
    this.shadowRoot.querySelector('[data-testid="btn-start-ai"]')
      .addEventListener('click', () => {
        const name = this.shadowRoot.querySelector('#player-name').value.trim() || 'Player';
        const difficulty = this.shadowRoot.querySelector('#difficulty').value;
        this._emit('start-ai-game', { playerName: name, difficulty });
      });

    // Create room
    this.shadowRoot.querySelector('[data-testid="btn-create-room"]')
      .addEventListener('click', () => {
        const name = this.shadowRoot.querySelector('#host-name').value.trim() || 'Host';
        this._emit('host-online-game', { playerName: name });
      });

    // Join room
    this.shadowRoot.querySelector('[data-testid="btn-join-room"]')
      .addEventListener('click', () => {
        const name = this.shadowRoot.querySelector('#join-name').value.trim() || 'Guest';
        const roomCode = this.shadowRoot.querySelector('#room-input').value.trim();
        this._emit('join-online-game', { playerName: name, roomCode });
      });
  }

  /**
   * Show or hide the resume button.
   * @param {boolean} show
   */
  showResumeButton(show) {
    this.shadowRoot.querySelector('[data-testid="menu-resume"]').hidden = !show;
  }

  /**
   * Display the room code after hosting.
   * @param {string} code
   */
  showRoomCode(code) {
    const display = this.shadowRoot.querySelector('.room-code-display');
    display.hidden = false;
    this.shadowRoot.querySelector('.room-code').textContent = code;
  }

  _showScreen(screen) {
    this._mainMenu.style.display = screen === 'main' ? '' : 'none';
    this._aiSetup.classList.toggle('active', screen === 'ai');
    this._hostSetup.classList.toggle('active', screen === 'host');
    this._joinSetup.classList.toggle('active', screen === 'join');
  }

  _emit(eventName, detail) {
    this.dispatchEvent(new CustomEvent(eventName, { bubbles: true, composed: true, detail }));
  }
}

customElements.define('game-menu', GameMenu);
