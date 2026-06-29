/**
 * Phase 10 — Phase Editor Web Component
 * 
 * Custom phase list editor. Users can create, reorder, and save custom phase orders.
 */

import { PHASE_DEFINITIONS } from '../game-engine/phase-validator.js';
import { createPhaseList, addPhaseList, getPhaseLists, deletePhaseList } from '../storage/phase-list-store.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: block; }
    .overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85); display: flex; align-items: center;
      justify-content: center; z-index: 1000; padding: 16px;
    }
    .overlay[hidden] { display: none; }
    .editor {
      background: #1a1a2e; border-radius: 12px; padding: 24px;
      max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto; color: #fff;
    }
    h2 { margin: 0 0 16px; color: var(--color-accent, #ffab00); }
    .phase-item {
      display: flex; align-items: center; gap: 8px;
      padding: 8px; margin: 4px 0; background: rgba(255,255,255,0.05);
      border-radius: 6px; cursor: grab; font-size: 0.9em;
    }
    .phase-item:active { cursor: grabbing; }
    .phase-item .num { color: var(--color-accent); font-weight: bold; min-width: 24px; }
    .phase-item .desc { flex: 1; }
    .phase-item .remove-btn {
      background: none; border: none; color: #ef5350; cursor: pointer;
      font-size: 1.2em; padding: 4px;
    }
    .controls { display: flex; gap: 8px; margin-top: 16px; }
    .btn {
      padding: 10px 16px; border: none; border-radius: 6px;
      cursor: pointer; font-weight: bold; font-size: 0.9em;
    }
    .btn-primary { background: var(--color-accent); color: #000; }
    .btn-secondary { background: rgba(255,255,255,0.2); color: #fff; }
    .btn-danger { background: #ef5350; color: #fff; }
    input {
      width: 100%; padding: 8px; border: 2px solid rgba(255,255,255,0.3);
      border-radius: 6px; background: rgba(255,255,255,0.1); color: #fff;
      font-size: 0.9em; margin-bottom: 12px;
    }
    .saved-lists { margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; }
    .saved-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 6px 0; font-size: 0.85em;
    }
    .saved-item button { margin-left: 8px; }
    .available-phases { margin: 12px 0; }
    .add-phase-btn {
      display: inline-block; padding: 4px 8px; margin: 2px;
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
      border-radius: 4px; color: #fff; font-size: 0.8em; cursor: pointer;
    }
    .add-phase-btn:hover { background: rgba(255,255,255,0.2); }
  </style>
  <div class="overlay" hidden role="dialog" aria-label="Phase List Editor" data-testid="phase-editor">
    <div class="editor">
      <h2>Custom Phase List</h2>
      <input type="text" placeholder="List name..." maxlength="30" class="list-name" data-testid="phase-list-name">
      
      <div class="current-phases" data-testid="current-phases"></div>
      
      <div class="available-phases">
        <p style="font-size:0.8em;color:rgba(255,255,255,0.6)">Click to add phases:</p>
        <div class="phase-buttons"></div>
      </div>
      
      <div class="controls">
        <button class="btn btn-primary" data-testid="btn-save-list">Save List</button>
        <button class="btn btn-secondary" data-testid="btn-clear-list">Clear</button>
        <button class="btn btn-secondary" data-testid="btn-close-editor">Close</button>
      </div>
      
      <div class="saved-lists">
        <h3 style="font-size:0.9em;color:rgba(255,255,255,0.7)">Saved Lists</h3>
        <div class="saved-list-items" data-testid="saved-lists"></div>
      </div>
    </div>
  </div>
`;

export class PhaseEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._overlay = this.shadowRoot.querySelector('.overlay');
    this._currentPhases = this.shadowRoot.querySelector('.current-phases');
    this._phaseButtons = this.shadowRoot.querySelector('.phase-buttons');
    this._savedItems = this.shadowRoot.querySelector('.saved-list-items');
    this._nameInput = this.shadowRoot.querySelector('.list-name');
    /** @type {number[]} */
    this._phases = [];
  }

  connectedCallback() {
    this.shadowRoot.querySelector('[data-testid="btn-save-list"]')
      .addEventListener('click', () => this._saveList());
    this.shadowRoot.querySelector('[data-testid="btn-clear-list"]')
      .addEventListener('click', () => this._clearList());
    this.shadowRoot.querySelector('[data-testid="btn-close-editor"]')
      .addEventListener('click', () => this.hide());

    this._renderAvailablePhases();
  }

  show() {
    this._overlay.hidden = false;
    this._phases = [];
    this._nameInput.value = '';
    this._render();
    this._renderSavedLists();
  }

  hide() {
    this._overlay.hidden = true;
  }

  _renderAvailablePhases() {
    this._phaseButtons.innerHTML = '';
    for (const def of PHASE_DEFINITIONS) {
      const btn = document.createElement('button');
      btn.className = 'add-phase-btn';
      btn.textContent = `${def.phaseNumber}: ${def.description}`;
      btn.addEventListener('click', () => {
        this._phases.push(def.phaseNumber);
        this._render();
      });
      this._phaseButtons.appendChild(btn);
    }
  }

  _render() {
    this._currentPhases.innerHTML = '';
    this._phases.forEach((phaseNum, idx) => {
      const def = PHASE_DEFINITIONS[phaseNum - 1];
      const item = document.createElement('div');
      item.className = 'phase-item';
      item.innerHTML = `
        <span class="num">${idx + 1}.</span>
        <span class="desc">Phase ${phaseNum}: ${def.description}</span>
        <button class="remove-btn" aria-label="Remove">&times;</button>
      `;
      item.querySelector('.remove-btn').addEventListener('click', () => {
        this._phases.splice(idx, 1);
        this._render();
      });
      this._currentPhases.appendChild(item);
    });
  }

  _renderSavedLists() {
    const lists = getPhaseLists();
    this._savedItems.innerHTML = '';
    if (lists.length === 0) {
      this._savedItems.innerHTML = '<p style="font-size:0.8em;color:rgba(255,255,255,0.5)">No saved lists</p>';
      return;
    }
    for (const list of lists) {
      const item = document.createElement('div');
      item.className = 'saved-item';
      item.innerHTML = `
        <span>${list.name} (${list.phases.length} phases)</span>
        <button class="btn btn-danger" style="padding:4px 8px;font-size:0.75em">Delete</button>
      `;
      item.querySelector('button').addEventListener('click', () => {
        deletePhaseList(list.id);
        this._renderSavedLists();
      });
      this._savedItems.appendChild(item);
    }
  }

  _saveList() {
    const name = this._nameInput.value.trim();
    if (!name) { alert('Please enter a list name'); return; }
    if (this._phases.length < 1) { alert('Add at least one phase'); return; }
    const list = createPhaseList(name, [...this._phases]);
    addPhaseList(list);
    this._renderSavedLists();
    this._nameInput.value = '';
    this._phases = [];
    this._render();
  }

  _clearList() {
    this._phases = [];
    this._render();
  }
}

customElements.define('phase-editor', PhaseEditor);
