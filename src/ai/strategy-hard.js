/**
 * Phase 10 — Hard AI Strategy
 * 
 * Strategic decision-making: evaluates card utility deeply, considers
 * opponent's probable phase, makes optimal choices with Skip/Wild awareness.
 */

/** @typedef {import('../types.js').Card} Card */
/** @typedef {import('../types.js').GameState} GameState */
/** @typedef {import('../types.js').HitAction} HitAction */

import { evaluateCardUtility, groupByPhaseProgress } from './card-evaluator.js';
import { findValidCombinations, validateHit, getPhaseDefinition } from '../game-engine/phase-validator.js';
import { getPlayerPhaseNumber } from '../game-engine/rules.js';

/**
 * Decide where to draw from (Hard strategy).
 * Makes a calculated decision based on card utility vs revealing information.
 * @param {GameState} state
 * @param {string} playerId
 * @returns {'pile' | 'discard'}
 */
export function chooseDrawSource(state, playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return 'pile';

  if (state.discardPile.length === 0) return 'pile';

  const topDiscard = state.discardPile[state.discardPile.length - 1];
  const phaseNumber = getPlayerPhaseNumber(state, playerId);

  // Always take a Wild card
  if (topDiscard.type === 'wild') return 'discard';

  // Evaluate the discard card's utility
  const utility = evaluateCardUtility(topDiscard, player.hand, phaseNumber);

  // Calculate average expected utility from draw pile
  // Assume average card utility is ~30 for a random card
  const averageDrawUtility = 30;

  // Take from discard if significantly better than average
  if (utility > averageDrawUtility + 20) return 'discard';

  // Consider: taking from discard reveals what we're collecting
  // If we're close to completing phase, be more aggressive
  const progress = groupByPhaseProgress(player.hand, phaseNumber);
  const avgProgress = progress.reduce((sum, g) => sum + g.progress, 0) / progress.length;

  if (avgProgress > 0.7 && utility > averageDrawUtility) {
    return 'discard';
  }

  return 'pile';
}

/**
 * Choose which card to discard (Hard strategy).
 * Minimizes hand utility loss. Also considers what opponent might need.
 * @param {GameState} state
 * @param {string} playerId
 * @param {Card | null} drawnFromDiscard
 * @returns {Card}
 */
export function chooseDiscard(state, playerId, drawnFromDiscard) {
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.hand.length === 0) return player.hand[0];

  const phaseNumber = getPlayerPhaseNumber(state, playerId);
  const opponent = state.players.find(p => p.id !== playerId);
  const opponentPhaseNumber = opponent ? getPlayerPhaseNumber(state, opponent.id) : 1;

  // Score each card by utility to us, and danger to opponent
  const scored = player.hand
    .filter(c => {
      if (drawnFromDiscard && c.id === drawnFromDiscard.id) return false;
      return true;
    })
    .map(card => {
      const ourUtility = evaluateCardUtility(card, player.hand, phaseNumber);
      const opponentDanger = estimateOpponentNeed(card, opponentPhaseNumber);

      // Lower score = better to discard
      // We want to discard cards with low utility to us AND low danger to opponent
      const discardScore = ourUtility + (opponentDanger * 0.5);
      return { card, discardScore };
    })
    .sort((a, b) => a.discardScore - b.discardScore);

  if (scored.length === 0) return player.hand[0];

  // Discard the least valuable card that's also least helpful to opponent
  return scored[0].card;
}

/**
 * Estimate how much a card might help the opponent.
 * @param {Card} card
 * @param {number} opponentPhaseNumber
 * @returns {number} Danger score 0-50
 */
function estimateOpponentNeed(card, opponentPhaseNumber) {
  if (card.type === 'wild') return 50; // Never discard wilds anyway
  if (card.type === 'skip') return 5; // Skip cards are low danger

  const definition = getPhaseDefinition(opponentPhaseNumber);
  if (!definition) return 10;

  // Check if this card type could help opponent
  let danger = 10;

  for (const groupDef of definition.groups) {
    if (groupDef.type === 'run') {
      // Mid-range numbers are more useful for runs
      if (card.number >= 4 && card.number <= 9) danger = Math.max(danger, 25);
    }
    if (groupDef.type === 'color') {
      // Any number card could help a color group
      danger = Math.max(danger, 20);
    }
    if (groupDef.type === 'set') {
      // Any specific number could help
      danger = Math.max(danger, 15);
    }
  }

  return danger;
}

/**
 * Attempt to lay down the phase (Hard strategy).
 * Always lays down when possible — holding back rarely helps.
 * @param {GameState} state
 * @param {string} playerId
 * @returns {Card[][] | null}
 */
export function attemptLayDown(state, playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.hasLaidDown) return null;

  const phaseNumber = getPlayerPhaseNumber(state, playerId);
  return findValidCombinations(player.hand, phaseNumber);
}

/**
 * Attempt to hit on laid-down groups (Hard strategy).
 * Prioritizes hits that empty the hand fastest to go out.
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

  // Sort hand cards: prefer discarding high-point cards as hits
  const sortedHand = [...player.hand].sort((a, b) => {
    const scoreA = getCardPenalty(a);
    const scoreB = getCardPenalty(b);
    return scoreB - scoreA; // Highest penalty first (prioritize getting rid of them)
  });

  for (const card of sortedHand) {
    if (card.type === 'skip') continue;
    if (usedCardIds.has(card.id)) continue;

    let bestHit = null;

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
          bestHit = {
            card,
            targetPlayerId: targetPlayer.id,
            targetGroupIndex: gi
          };
          break;
        }
      }
      if (bestHit) break;
    }

    if (bestHit) {
      hits.push(bestHit);
      usedCardIds.add(card.id);
    }
  }

  return hits;
}

/**
 * Get penalty value of a card (for prioritizing hits).
 * @param {Card} card
 * @returns {number}
 */
function getCardPenalty(card) {
  switch (card.type) {
    case 'wild': return 25;
    case 'skip': return 15;
    case 'number': return card.number <= 9 ? 5 : 10;
    default: return 0;
  }
}

/**
 * Decide whether to use a Skip card strategically.
 * Hard AI saves Skip for when opponent is close to going out.
 * @param {GameState} state
 * @param {string} playerId
 * @param {Card} skipCard
 * @returns {boolean} Whether to discard the Skip card now
 */
export function shouldUseSkip(state, playerId, skipCard) {
  const opponent = state.players.find(p => p.id !== playerId);
  if (!opponent) return false;

  // Use Skip when opponent has few cards (close to going out)
  if (opponent.hand.length <= 4) return true;

  // Use Skip when opponent just laid down (likely to go out soon)
  if (opponent.hasLaidDown && opponent.hand.length <= 6) return true;

  return false;
}
