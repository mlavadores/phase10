/**
 * Phase 10 — Card Element Web Component
 * 
 * Renders a single card (face-up or face-down).
 * Supports selection state, drag, and accessibility.
 */

const CARD_COLORS = {
  red: '#ff4757',
  blue: '#3742fa',
  green: '#2ed573',
  yellow: '#ffa502'
};

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-block;
      width: var(--card-width, 72px);
      height: var(--card-height, 104px);
      user-select: none;
      cursor: pointer;
    }
    .card {
      width: 100%;
      height: 100%;
      border-radius: var(--card-radius, 12px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 700;
      box-shadow: var(--shadow-card, 0 4px 12px rgba(0,0,0,0.4));
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(4px);
    }
    .card.face-up {
      background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
      border: 2px solid var(--card-border-color, #e2e8f0);
    }
    .card.face-down {
      background: linear-gradient(135deg, #1e293b, #334155);
      border: 2px solid #475569;
    }
    .card.face-down::after {
      content: '';
      position: absolute;
      width: 60%;
      height: 60%;
      border-radius: 50%;
      border: 2px solid rgba(99, 102, 241, 0.3);
    }
    .card.selected {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.5), 0 0 0 2px var(--color-accent, #6366f1);
      border-color: var(--color-accent, #6366f1);
    }
    .card:hover:not(.face-down) {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    }
    .card:focus-visible {
      outline: 2px solid var(--color-accent, #6366f1);
      outline-offset: 3px;
    }
    .card-number {
      font-size: 1.8em;
      line-height: 1;
      letter-spacing: -0.5px;
    }
    .card-type-label {
      font-size: 0.6em;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
      opacity: 0.7;
    }
    .card.wild {
      background: linear-gradient(135deg, #a855f7, #6366f1, #3b82f6, #06b6d4);
      border: 2px solid #a855f7;
    }
    .card.wild .card-number,
    .card.wild .card-type-label {
      color: #fff;
      text-shadow: 0 1px 4px rgba(0,0,0,0.4);
    }
    .card.skip {
      background: linear-gradient(135deg, #374151, #4b5563);
      border: 2px solid #6b7280;
    }
    .card.skip .card-number,
    .card.skip .card-type-label {
      color: #fff;
    }
    @media (prefers-reduced-motion: reduce) {
      .card { transition: none; }
    }
  </style>
  <div class="card" role="option" tabindex="0">
    <span class="card-number"></span>
    <span class="card-type-label"></span>
  </div>
`;

export class CardElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._cardEl = this.shadowRoot.querySelector('.card');
    this._numberEl = this.shadowRoot.querySelector('.card-number');
    this._labelEl = this.shadowRoot.querySelector('.card-type-label');
  }

  static get observedAttributes() {
    return ['card-data', 'face-down', 'selected', 'draggable'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this._render();
  }

  connectedCallback() {
    this._render();
    this._cardEl.addEventListener('click', () => this._handleClick());
    this._cardEl.addEventListener('keydown', (e) => this._handleKeydown(e));
  }

  /**
   * Set card data from JavaScript.
   * @param {import('../types.js').Card} card
   */
  setCard(card) {
    this._card = card;
    this._render();
  }

  get card() {
    return this._card;
  }

  _render() {
    const card = this._card;
    const faceDown = this.hasAttribute('face-down');
    const selected = this.hasAttribute('selected');

    this._cardEl.classList.toggle('face-down', faceDown);
    this._cardEl.classList.toggle('face-up', !faceDown);
    this._cardEl.classList.toggle('selected', selected);
    this._cardEl.setAttribute('aria-selected', String(selected));

    if (faceDown || !card) {
      this._numberEl.textContent = '';
      this._labelEl.textContent = '';
      this._cardEl.classList.remove('wild', 'skip');
      this._cardEl.setAttribute('aria-label', 'Face-down card');
      return;
    }

    this._cardEl.classList.toggle('wild', card.type === 'wild');
    this._cardEl.classList.toggle('skip', card.type === 'skip');

    if (card.type === 'number') {
      this._numberEl.textContent = card.number;
      this._labelEl.textContent = card.color;
      this._cardEl.style.setProperty('--card-border-color', CARD_COLORS[card.color] || '#ccc');
      this._numberEl.style.color = CARD_COLORS[card.color] || '#333';
      this._cardEl.setAttribute('aria-label', `${card.color} ${card.number}`);
    } else if (card.type === 'wild') {
      this._numberEl.textContent = 'W';
      this._labelEl.textContent = 'wild';
      this._cardEl.setAttribute('aria-label', 'Wild card');
    } else if (card.type === 'skip') {
      this._numberEl.textContent = 'S';
      this._labelEl.textContent = 'skip';
      this._cardEl.setAttribute('aria-label', 'Skip card');
    }
  }

  _handleClick() {
    this.dispatchEvent(new CustomEvent('card-click', {
      bubbles: true,
      composed: true,
      detail: { card: this._card }
    }));
  }

  _handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleClick();
    }
  }
}

customElements.define('card-element', CardElement);
