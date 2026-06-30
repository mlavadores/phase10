/**
 * Phase 10 — Phase Display Web Component
 * 
 * Shows phase progress tracker for both players.
 */

import { getPhaseDefinition } from '../game-engine/phase-validator.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .phase-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .player-phase {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 0.8em;
    }
    .player-name {
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #e2e8f0;
      font-size: 0.85em;
    }
    .phase-info {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }
    .phase-number {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      border-radius: 4px;
      padding: 1px 5px;
      font-weight: 700;
      font-size: 0.75em;
      white-space: nowrap;
    }
    .phase-desc {
      font-size: 0.7em;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .completed-indicator {
      color: #4ade80;
      font-weight: 600;
      font-size: 0.8em;
    }
    @media (max-width: 480px) {
      .phase-desc { display: none; }
    }
  </style>
  <div class="phase-container" role="region" aria-label="Phase progress" data-testid="phase-display">
  </div>
`;

export class PhaseDisplay extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._container = this.shadowRoot.querySelector('.phase-container');
  }

  /**
   * Update the phase display with current game state.
   * @param {import('../types.js').Player[]} players
   * @param {number[]} phaseList
   */
  update(players, phaseList) {
    this._container.innerHTML = '';

    for (const player of players) {
      const phaseIndex = player.currentPhase - 1;
      const isComplete = player.currentPhase > phaseList.length;
      const currentPhaseNumber = isComplete
        ? null
        : phaseList[phaseIndex];

      const row = document.createElement('div');
      row.className = 'player-phase';

      const nameEl = document.createElement('span');
      nameEl.className = 'player-name';
      nameEl.textContent = player.name;

      const infoEl = document.createElement('span');
      infoEl.className = 'phase-info';

      if (isComplete) {
        infoEl.innerHTML = '<span class="completed-indicator">All Phases Complete!</span>';
      } else {
        const def = getPhaseDefinition(currentPhaseNumber);
        infoEl.innerHTML = `
          <span class="phase-number">Phase ${currentPhaseNumber}</span>
          <span class="phase-desc">${def ? def.description : ''}</span>
        `;
      }

      row.appendChild(nameEl);
      row.appendChild(infoEl);
      this._container.appendChild(row);
    }
  }
}

customElements.define('phase-display', PhaseDisplay);
