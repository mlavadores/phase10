/**
 * Phase 10 — AI Player Orchestrator
 * 
 * Coordinates AI turn execution with variable thinking delays.
 * Dispatches to Easy or Hard strategy based on difficulty setting.
 */

/** @typedef {import('../types.js').Card} Card */
/** @typedef {import('../types.js').GameState} GameState */
/** @typedef {import('../types.js').PlayerAction} PlayerAction */
/** @typedef {import('../types.js').AIDifficulty} AIDifficulty */

import * as easyStrategy from './strategy-easy.js';
import * as hardStrategy from './strategy-hard.js';

/**
 * Get a random thinking delay (500ms - 3000ms).
 * @returns {number} Delay in milliseconds
 */
function getThinkingDelay() {
  return 500 + Math.floor(Math.random() * 2500);
}

/**
 * Wait for a specified duration (simulates thinking).
 * @param {number} ms
 * @returns {Promise<void>}
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get the strategy module for the given difficulty.
 * @param {AIDifficulty} difficulty
 */
function getStrategy(difficulty) {
  return difficulty === 'hard' ? hardStrategy : easyStrategy;
}

/**
 * Execute a full AI turn with thinking delays.
 * Returns a sequence of actions to be applied by the controller.
 * @param {GameState} state
 * @param {string} playerId
 * @param {AIDifficulty} difficulty
 * @returns {Promise<PlayerAction[]>}
 */
export async function takeTurn(state, playerId, difficulty) {
  const strategy = getStrategy(difficulty);
  /** @type {PlayerAction[]} */
  const actions = [];
  const player = state.players.find(p => p.id === playerId);

  // 1. DRAW
  await wait(getThinkingDelay());
  const drawSource = strategy.chooseDrawSource(state, playerId);
  actions.push({
    type: 'draw',
    playerId,
    payload: { source: drawSource }
  });

  // Simulate the draw to update our local knowledge
  let drawnCard = null;
  if (drawSource === 'discard' && state.discardPile.length > 0) {
    drawnCard = state.discardPile[state.discardPile.length - 1];
  }

  // 2. LAY DOWN PHASE (if possible and not already laid down)
  let justLaidDown = false;
  if (!player.hasLaidDown) {
    await wait(getThinkingDelay());
    const layDown = strategy.attemptLayDown(state, playerId);
    if (layDown) {
      actions.push({
        type: 'laydown',
        playerId,
        payload: { groups: layDown }
      });
      justLaidDown = true;
    }
  }

  // 3. HIT — attempt if phase is already down (this turn OR previous turns)
  if (player.hasLaidDown || justLaidDown) {
    await wait(getThinkingDelay());
    const hits = strategy.attemptHits(state, playerId);
    for (const hit of hits) {
      await wait(Math.min(getThinkingDelay(), 800));
      actions.push({
        type: 'hit',
        playerId,
        payload: {
          card: hit.card,
          targetPlayerId: hit.targetPlayerId,
          targetGroupIndex: hit.targetGroupIndex
        }
      });
    }
  }

  // 4. DISCARD
  await wait(getThinkingDelay());
  const discardCard = strategy.chooseDiscard(
    state,
    playerId,
    drawSource === 'discard' ? drawnCard : null
  );
  actions.push({
    type: 'discard',
    playerId,
    payload: { card: discardCard }
  });

  // Check if discarding a Skip card (auto-targets opponent in 2-player)
  if (discardCard.type === 'skip') {
    const opponent = state.players.find(p => p.id !== playerId);
    if (opponent) {
      actions.push({
        type: 'skip-target',
        playerId,
        payload: { targetPlayerId: opponent.id }
      });
    }
  }

  return actions;
}

/**
 * Quick evaluation: can the AI complete its phase with current hand?
 * Used for deciding urgency of moves.
 * @param {GameState} state
 * @param {string} playerId
 * @returns {boolean}
 */
export function canCompletePhase(state, playerId) {
  const strategy = getStrategy('easy');
  return strategy.attemptLayDown(state, playerId) !== null;
}
