/**
 * Phase 10 — Card Evaluator Module
 * 
 * Evaluates card utility relative to the current phase requirement.
 * Used by AI strategies to make informed decisions.
 */

/** @typedef {import('../types.js').Card} Card */
/** @typedef {import('../types.js').GameState} GameState */
/** @typedef {import('../types.js').PhaseGroup} PhaseGroup */

import { getPhaseDefinition } from '../game-engine/phase-validator.js';

/**
 * Evaluate how useful a card is for completing the current phase.
 * Higher score = more useful. Range: 0-100.
 * @param {Card} card
 * @param {Card[]} hand - Full hand including this card
 * @param {number} phaseNumber - Current phase number (1-10)
 * @returns {number} Utility score (0-100)
 */
export function evaluateCardUtility(card, hand, phaseNumber) {
  // Wild cards are always highly valuable
  if (card.type === 'wild') return 95;

  // Skip cards have moderate discard value but no phase value
  if (card.type === 'skip') return 20;

  const definition = getPhaseDefinition(phaseNumber);
  if (!definition) return 10;

  let maxScore = 0;

  for (const groupDef of definition.groups) {
    const score = evaluateCardForGroup(card, hand, groupDef);
    maxScore = Math.max(maxScore, score);
  }

  return maxScore;
}

/**
 * Evaluate a card's contribution to a specific group type.
 * @param {Card} card
 * @param {Card[]} hand
 * @param {PhaseGroup} groupDef
 * @returns {number} Score 0-90
 */
function evaluateCardForGroup(card, hand, groupDef) {
  switch (groupDef.type) {
    case 'set':
      return evaluateForSet(card, hand, groupDef.count);
    case 'run':
      return evaluateForRun(card, hand, groupDef.count);
    case 'color':
      return evaluateForColor(card, hand, groupDef.count);
    default:
      return 0;
  }
}

/**
 * How useful is this card for forming a set?
 * @param {Card} card
 * @param {Card[]} hand
 * @param {number} requiredCount
 * @returns {number}
 */
function evaluateForSet(card, hand, requiredCount) {
  if (card.type !== 'number') return 0;

  // Count how many cards of the same number exist in hand
  const sameNumber = hand.filter(
    c => c.type === 'number' && c.number === card.number
  ).length;

  const wilds = hand.filter(c => c.type === 'wild').length;
  const totalPossible = sameNumber + wilds;

  if (totalPossible >= requiredCount) {
    // Can already complete this set — high value
    return 90;
  }

  // Partial progress — scale by how close we are
  return Math.round((sameNumber / requiredCount) * 70);
}

/**
 * How useful is this card for forming a run?
 * @param {Card} card
 * @param {Card[]} hand
 * @param {number} requiredCount
 * @returns {number}
 */
function evaluateForRun(card, hand, requiredCount) {
  if (card.type !== 'number') return 0;

  const numberCards = hand.filter(c => c.type === 'number');
  const wilds = hand.filter(c => c.type === 'wild').length;

  // Find the longest consecutive sequence this card participates in
  const uniqueNumbers = [...new Set(numberCards.map(c => c.number))].sort((a, b) => a - b);

  // Find sequences containing this card's number
  let bestSequenceLength = 0;
  for (let start = Math.max(1, card.number - requiredCount + 1); start <= Math.min(12 - requiredCount + 1, card.number); start++) {
    let cardsInRange = 0;
    let gaps = 0;
    for (let n = start; n < start + requiredCount; n++) {
      if (uniqueNumbers.includes(n)) {
        cardsInRange++;
      } else {
        gaps++;
      }
    }

    const fillable = cardsInRange + Math.min(gaps, wilds);
    if (fillable >= requiredCount) {
      bestSequenceLength = requiredCount;
      break;
    }
    bestSequenceLength = Math.max(bestSequenceLength, cardsInRange);
  }

  if (bestSequenceLength >= requiredCount) return 90;
  return Math.round((bestSequenceLength / requiredCount) * 70);
}

/**
 * How useful is this card for forming a color group?
 * @param {Card} card
 * @param {Card[]} hand
 * @param {number} requiredCount
 * @returns {number}
 */
function evaluateForColor(card, hand, requiredCount) {
  if (card.type !== 'number') return 0;

  const sameColor = hand.filter(
    c => c.type === 'number' && c.color === card.color
  ).length;

  const wilds = hand.filter(c => c.type === 'wild').length;
  const totalPossible = sameColor + wilds;

  if (totalPossible >= requiredCount) return 90;
  return Math.round((sameColor / requiredCount) * 70);
}

/**
 * Group hand cards by their progress toward the current phase.
 * Returns cards organized by which phase group they contribute to.
 * @param {Card[]} hand
 * @param {number} phaseNumber
 * @returns {Array<{groupIndex: number, cards: Card[], progress: number}>}
 */
export function groupByPhaseProgress(hand, phaseNumber) {
  const definition = getPhaseDefinition(phaseNumber);
  if (!definition) return [];

  const results = [];

  for (let i = 0; i < definition.groups.length; i++) {
    const groupDef = definition.groups[i];
    const contributing = findContributingCards(hand, groupDef);
    const progress = Math.min(1, contributing.length / groupDef.count);

    results.push({
      groupIndex: i,
      cards: contributing,
      progress
    });
  }

  return results;
}

/**
 * Find cards in hand that contribute to a specific group type.
 * @param {Card[]} hand
 * @param {PhaseGroup} groupDef
 * @returns {Card[]}
 */
function findContributingCards(hand, groupDef) {
  const numberCards = hand.filter(c => c.type === 'number');
  const wilds = hand.filter(c => c.type === 'wild');

  switch (groupDef.type) {
    case 'set': {
      // Find the most common number
      const counts = {};
      for (const card of numberCards) {
        counts[card.number] = (counts[card.number] || 0) + 1;
      }
      const bestNumber = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)[0];

      if (!bestNumber) return [...wilds];
      const matching = numberCards.filter(c => c.number === Number(bestNumber[0]));
      return [...matching, ...wilds].slice(0, groupDef.count);
    }
    case 'run': {
      // Find longest consecutive subsequence
      const unique = [...new Set(numberCards.map(c => c.number))].sort((a, b) => a - b);
      let bestRun = [];
      let currentRun = [];

      for (let i = 0; i < unique.length; i++) {
        if (i === 0 || unique[i] === unique[i - 1] + 1) {
          currentRun.push(unique[i]);
        } else {
          if (currentRun.length > bestRun.length) bestRun = currentRun;
          currentRun = [unique[i]];
        }
      }
      if (currentRun.length > bestRun.length) bestRun = currentRun;

      const runCards = numberCards.filter(c => bestRun.includes(c.number));
      return [...runCards, ...wilds].slice(0, groupDef.count);
    }
    case 'color': {
      // Find the most common color
      const counts = {};
      for (const card of numberCards) {
        counts[card.color] = (counts[card.color] || 0) + 1;
      }
      const bestColor = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)[0];

      if (!bestColor) return [...wilds];
      const matching = numberCards.filter(c => c.color === bestColor[0]);
      return [...matching, ...wilds].slice(0, groupDef.count);
    }
    default:
      return [];
  }
}
