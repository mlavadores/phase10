/**
 * Phase 10 — Easy AI Strategy
 * 
 * Basic decision-making: prioritizes collecting cards for current phase,
 * discards randomly from non-useful cards. Straightforward and predictable.
 */

/** @typedef {import('../types.js').Card} Card */
/** @typedef {import('../types.js').GameState} GameState */
/** @typedef {import('../types.js').HitAction} HitAction */

import { evaluateCardUtility } from './card-evaluator.js';
import { findValidCombinations, validateHit, getPhaseDefinition } from '../game-engine/phase-validator.js';
import { getPlayerPhaseNumber } from '../game-engine/rules.js';

/**
 * Decide where to draw from (Easy strategy).
 * Takes from discard if the card obviously helps; otherwise draws from pile.
 * @param {GameState} state
 * @param {string} playerId
 * @returns {'pile' | 'discard'}
 */
export function chooseDrawSource(state, playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return 'pile';

  // Check if discard pile has cards
  if (state.discardPile.length === 0) return 'pile';

  const topDiscard = state.discardPile[state.discardPile.length - 1];
  const phaseNumber = getPlayerPhaseNumber(state, playerId);

  // If discard card is wild, always take it
  if (topDiscard.type === 'wild') return 'discard';

  // Evaluate how useful the discard card is
  const utility = evaluateCardUtility(topDiscard, player.hand, phaseNumber);

  // Take from discard if utility is high (above 50), otherwise draw from pile
  if (utility >= 50) return 'discard';

  // 20% chance to take from discard anyway (simulate unpredictability)
  if (Math.random() < 0.2) return 'discard';

  return 'pile';
}

/**
 * Choose which card to discard (Easy strategy).
 * Discards a random card with lowest utility score.
 * Never discards Wild cards unless forced.
 * @param {GameState} state
 * @param {string} playerId
 * @param {Card | null} drawnFromDiscard - Card drawn from discard (cannot be discarded back)
 * @returns {Card}
 */
export function chooseDiscard(state, playerId, drawnFromDiscard) {
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.hand.length === 0) return player.hand[0];

  const phaseNumber = getPlayerPhaseNumber(state, playerId);

  // Score each card by utility
  const scored = player.hand
    .filter(c => {
      // Cannot discard the card just drawn from discard
      if (drawnFromDiscard && c.id === drawnFromDiscard.id) return false;
      return true;
    })
    .map(card => ({
      card,
      utility: evaluateCardUtility(card, player.hand, phaseNumber)
    }))
    .sort((a, b) => a.utility - b.utility);

  if (scored.length === 0) {
    // Fallback: must discard something
    return player.hand[0];
  }

  // Pick from the bottom 3 lowest-utility cards randomly
  const bottomCards = scored.slice(0, Math.min(3, scored.length));
  const randomIndex = Math.floor(Math.random() * bottomCards.length);
  return bottomCards[randomIndex].card;
}

/**
 * Attempt to lay down the phase (Easy strategy).
 * Always lays down when a valid combination exists.
 * @param {GameState} state
 * @param {string} playerId
 * @returns {Card[][] | null} Card groups to lay down, or null if not possible
 */
export function attemptLayDown(state, playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.hasLaidDown) return null;

  const phaseNumber = getPlayerPhaseNumber(state, playerId);
  return findValidCombinations(player.hand, phaseNumber);
}

/**
 * Attempt to hit on laid-down groups (Easy strategy).
 * Greedy: hits first valid target found for each card.
 * @param {GameState} state
 * @param {string} playerId
 * @returns {HitAction[]}
 */
export function attemptHits(state, playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (!player || !player.hasLaidDown) return [];

  /** @type {HitAction[]} */
  const hits = [];
  const usedCardIds = new Set();

  for (const card of player.hand) {
    if (card.type === 'skip') continue; // Skip cards can't hit
    if (usedCardIds.has(card.id)) continue;

    // Try each player's laid-down groups
    for (const targetPlayer of state.players) {
      if (targetPlayer.laidDownGroups.length === 0) continue;

      const phaseNumber = getPlayerPhaseNumber(state, targetPlayer.id);
      const definition = getPhaseDefinition(phaseNumber);
      if (!definition) continue;

      for (let gi = 0; gi < targetPlayer.laidDownGroups.length; gi++) {
        const group = targetPlayer.laidDownGroups[gi];
        const groupDef = definition.groups[gi];
        if (!groupDef) continue;

        if (validateHit(card, group, groupDef)) {
          hits.push({
            card,
            targetPlayerId: targetPlayer.id,
            targetGroupIndex: gi
          });
          usedCardIds.add(card.id);
          break;
        }
      }
      if (usedCardIds.has(card.id)) break;
    }
  }

  return hits;
}
