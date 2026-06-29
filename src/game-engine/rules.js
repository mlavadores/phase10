/**
 * Phase 10 — Rules Module
 * 
 * Enforces game rules: valid actions, turn structure,
 * round-end and game-end conditions.
 */

/** @typedef {import('../types.js').Card} Card */
/** @typedef {import('../types.js').GameState} GameState */

import { getCurrentPlayer } from './game-state.js';

/**
 * Check if drawing from the specified source is valid.
 * @param {GameState} state
 * @param {'pile' | 'discard'} source
 * @returns {boolean}
 */
export function isValidDraw(state, source) {
  // Can only draw during 'draw' phase
  if (state.turnPhase !== 'draw') return false;

  // Must have cards to draw from
  if (source === 'pile') {
    // Draw pile can be reshuffled from discard if empty, so always valid
    return true;
  }

  if (source === 'discard') {
    // Must have at least one card on discard pile
    return state.discardPile.length > 0;
  }

  return false;
}

/**
 * Check if discarding a specific card is valid.
 * Rule TR-4: Cannot discard the card just drawn from the discard pile.
 * @param {GameState} state
 * @param {Card} card
 * @returns {{valid: boolean, error?: string}}
 */
export function isValidDiscard(state, card) {
  // Can only discard during 'discard' phase (or 'action' phase to end turn)
  if (state.turnPhase !== 'action' && state.turnPhase !== 'discard') {
    return { valid: false, error: 'Cannot discard during draw phase' };
  }

  // Card must be in current player's hand
  const player = getCurrentPlayer(state);
  const inHand = player.hand.some(c => c.id === card.id);
  if (!inHand) {
    return { valid: false, error: 'Card is not in your hand' };
  }

  // TR-4: Cannot discard the same card drawn from discard pile this turn
  if (state.drawnFrom === 'discard' && state.drawnCard && state.drawnCard.id === card.id) {
    return { valid: false, error: 'Cannot discard the card you just drew from the discard pile' };
  }

  return { valid: true };
}

/**
 * Check if a player can lay down their phase.
 * Must be in 'action' phase, not have already laid down, and not have completed all phases.
 * @param {GameState} state
 * @param {string} playerId
 * @returns {boolean}
 */
export function canLayDownPhase(state, playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return false;

  // Must be current player's turn
  if (state.players[state.currentPlayerIndex].id !== playerId) return false;

  // Must be in action phase
  if (state.turnPhase !== 'action') return false;

  // Must not have already laid down this round
  if (player.hasLaidDown) return false;

  // Must still have phases to complete
  if (player.currentPhase > state.phaseList.length) return false;

  return true;
}

/**
 * Check if a player can hit (add cards to laid-down groups).
 * Must have already laid down their own phase this round.
 * @param {GameState} state
 * @param {string} playerId
 * @returns {boolean}
 */
export function canHit(state, playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return false;

  // Must be current player's turn
  if (state.players[state.currentPlayerIndex].id !== playerId) return false;

  // Must be in action phase
  if (state.turnPhase !== 'action') return false;

  // Must have already laid down this round (HR-1)
  if (!player.hasLaidDown) return false;

  // Must have cards in hand to hit with
  if (player.hand.length === 0) return false;

  return true;
}

/**
 * Check if the round is over (a player has no cards left).
 * @param {GameState} state
 * @returns {boolean}
 */
export function isRoundOver(state) {
  return state.players.some(p => p.hand.length === 0);
}

/**
 * Check if the game is over.
 * Game ends when the round is over AND at least one player has completed
 * all phases in the phase list.
 * @param {GameState} state
 * @returns {boolean}
 */
export function isGameOver(state) {
  if (!isRoundOver(state)) return false;

  const totalPhases = state.phaseList.length;

  // A player who laid down this round will have their phase advanced
  // Check if any player has completed (or will complete) the final phase
  return state.players.some(player => {
    // Player completed final phase this round (laid down during the last phase)
    if (player.hasLaidDown && player.currentPhase >= totalPhases) return true;
    // Player already advanced past all phases
    if (player.currentPhase > totalPhases) return true;
    return false;
  });
}

/**
 * Check if it's currently the given player's turn.
 * @param {GameState} state
 * @param {string} playerId
 * @returns {boolean}
 */
export function isPlayerTurn(state, playerId) {
  return state.players[state.currentPlayerIndex].id === playerId;
}

/**
 * Check if undo is available.
 * Undo is only available during the current player's own turn and
 * only if there's a snapshot to restore.
 * @param {GameState} state
 * @param {string} playerId
 * @returns {boolean}
 */
export function canUndo(state, playerId) {
  // Must be current player's turn
  if (!isPlayerTurn(state, playerId)) return false;

  // Must have a snapshot to restore
  if (!state.undoSnapshot) return false;

  // Cannot undo in online mode (MP-5)
  if (state.config.mode === 'online') return false;

  return true;
}

/**
 * Get the phase number a player is currently working on from the phase list.
 * @param {GameState} state
 * @param {string} playerId
 * @returns {number} The actual phase number (1-10) from the phase list
 */
export function getPlayerPhaseNumber(state, playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return 1;

  const phaseIndex = player.currentPhase - 1;
  if (phaseIndex >= state.phaseList.length) {
    return state.phaseList[state.phaseList.length - 1];
  }
  return state.phaseList[phaseIndex];
}
