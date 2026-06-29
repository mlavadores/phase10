/**
 * Phase 10 — Player Hand Web Component
 * 
 * Displays the current player's interactive hand.
 * Supports card selection, keyboard navigation, and drag initiation.
 */

import './card-element.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
    }
    .hand-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 5px;
      padding: 6px;
      min-height: calc(var(--card-height, 104px) * 0.85 + 12px);
    }
    .hand-container.disabled {
      opacity: 0.5;
      pointer-events: none;
    }
    card-element {
      flex-shrink: 0;
    }
    .hand-label {
      text-align: center;
      font-size: 0.75em;
      color: #64748b;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    @media (max-width: 480px) {
      .hand-container {
        gap: 2px;
        padding: 4px;
      }
    }
  </style>
  <div class="hand-label" aria-hidden="true">Your Hand</div>
  <div class="hand-container" role="listbox" aria-label="Your cards" data-testid="player-hand">
  </div>
`;

export class PlayerHand extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._container = this.shadowRoot.querySelector('.hand-container');
    /** @type {Set<string>} */
    this._selectedIds = new Set();
    /** @type {import('../types.js').Card[]} */
    this._cards = [];
    this._focusIndex = 0;
  }

  connectedCallback() {
    this._container.addEventListener('card-click', (e) => this._handleCardClick(e));
    this._container.addEventListener('keydown', (e) => this._handleKeydown(e));
  }

  /**
   * Update the displayed cards.
   * @param {import('../types.js').Card[]} cards
   */
  setCards(cards) {
    this._cards = cards;
    this._render();
  }

  /**
   * Get currently selected card objects.
   * @returns {import('../types.js').Card[]}
   */
  getSelectedCards() {
    return this._cards.filter(c => this._selectedIds.has(c.id));
  }

  /**
   * Deselect all cards.
   */
  clearSelection() {
    this._selectedIds.clear();
    this._render();
  }

  /**
   * Set disabled state (not player's turn).
   * @param {boolean} disabled
   */
  setDisabled(disabled) {
    this._container.classList.toggle('disabled', disabled);
    if (disabled) {
      this._container.setAttribute('aria-disabled', 'true');
    } else {
      this._container.removeAttribute('aria-disabled');
    }
  }

  _render() {
    this._container.innerHTML = '';

    for (let i = 0; i < this._cards.length; i++) {
      const card = this._cards[i];
      const el = document.createElement('card-element');
      el.setCard(card);
      el.setAttribute('data-testid', `hand-card-${i}`);

      if (this._selectedIds.has(card.id)) {
        el.setAttribute('selected', '');
      }
      if (i === this._focusIndex) {
        el.shadowRoot.querySelector('.card').setAttribute('tabindex', '0');
      } else {
        el.shadowRoot.querySelector('.card').setAttribute('tabindex', '-1');
      }

      this._container.appendChild(el);
    }
  }

  _handleCardClick(e) {
    const card = e.detail.card;
    if (!card) return;

    if (this._selectedIds.has(card.id)) {
      this._selectedIds.delete(card.id);
    } else {
      this._selectedIds.add(card.id);
    }

    this._render();

    this.dispatchEvent(new CustomEvent('selection-change', {
      bubbles: true,
      composed: true,
      detail: { selectedCards: this.getSelectedCards() }
    }));
  }

  _handleKeydown(e) {
    const cardElements = this._container.querySelectorAll('card-element');
    if (cardElements.length === 0) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this._focusIndex = Math.min(this._focusIndex + 1, cardElements.length - 1);
      this._focusCard();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this._focusIndex = Math.max(this._focusIndex - 1, 0);
      this._focusCard();
    }
  }

  _focusCard() {
    const cardElements = this._container.querySelectorAll('card-element');
    if (cardElements[this._focusIndex]) {
      const inner = cardElements[this._focusIndex].shadowRoot.querySelector('.card');
      if (inner) inner.focus();
    }
  }
}

customElements.define('player-hand', PlayerHand);
