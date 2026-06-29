/**
 * Phase 10 — Phase Validator Module
 * 
 * Validates phase attempts: sets, runs, color groups.
 * Handles Wild card substitution logic.
 */

/** @typedef {import('../types.js').Card} Card */
/** @typedef {import('../types.js').PhaseDefinition} PhaseDefinition */
/** @typedef {import('../types.js').PhaseGroup} PhaseGroup */
/** @typedef {import('../types.js').ValidationResult} ValidationResult */

/**
 * All 10 official Phase definitions.
 * @type {PhaseDefinition[]}
 */
export const PHASE_DEFINITIONS = [
  { phaseNumber: 1, description: '2 sets of 3', groups: [{ type: 'set', count: 3 }, { type: 'set', count: 3 }] },
  { phaseNumber: 2, description: '1 set of 3 + 1 run of 4', groups: [{ type: 'set', count: 3 }, { type: 'run', count: 4 }] },
  { phaseNumber: 3, description: '1 set of 4 + 1 run of 4', groups: [{ type: 'set', count: 4 }, { type: 'run', count: 4 }] },
  { phaseNumber: 4, description: '1 run of 7', groups: [{ type: 'run', count: 7 }] },
  { phaseNumber: 5, description: '1 run of 8', groups: [{ type: 'run', count: 8 }] },
  { phaseNumber: 6, description: '1 run of 9', groups: [{ type: 'run', count: 9 }] },
  { phaseNumber: 7, description: '2 sets of 4', groups: [{ type: 'set', count: 4 }, { type: 'set', count: 4 }] },
  { phaseNumber: 8, description: '7 cards of 1 color', groups: [{ type: 'color', count: 7 }] },
  { phaseNumber: 9, description: '1 set of 5 + 1 set of 2', groups: [{ type: 'set', count: 5 }, { type: 'set', count: 2 }] },
  { phaseNumber: 10, description: '1 set of 5 + 1 set of 3', groups: [{ type: 'set', count: 5 }, { type: 'set', count: 3 }] }
];

/**
 * Get the phase definition for a given phase number.
 * @param {number} phaseNumber - 1-10
 * @returns {PhaseDefinition}
 */
export function getPhaseDefinition(phaseNumber) {
  return PHASE_DEFINITIONS[phaseNumber - 1];
}

/**
 * Validate a complete phase attempt (all groups at once).
 * @param {Card[][]} cardGroups - Array of card groups submitted by player
 * @param {number} phaseNumber - The phase number being attempted
 * @returns {ValidationResult}
 */
export function validatePhase(cardGroups, phaseNumber) {
  const definition = getPhaseDefinition(phaseNumber);

  if (!definition) {
    return { valid: false, error: `Invalid phase number: ${phaseNumber}` };
  }

  if (cardGroups.length !== definition.groups.length) {
    return {
      valid: false,
      error: `Phase ${phaseNumber} requires ${definition.groups.length} group(s), got ${cardGroups.length}`
    };
  }

  // Check no card appears in more than one group
  const allCardIds = new Set();
  for (const group of cardGroups) {
    for (const card of group) {
      if (allCardIds.has(card.id)) {
        return { valid: false, error: `Card ${card.id} appears in multiple groups` };
      }
      allCardIds.add(card.id);
    }
  }

  // Validate each group against its definition
  for (let i = 0; i < cardGroups.length; i++) {
    const cards = cardGroups[i];
    const groupDef = definition.groups[i];

    if (cards.length !== groupDef.count) {
      return {
        valid: false,
        error: `Group ${i + 1} requires ${groupDef.count} cards, got ${cards.length}`
      };
    }

    // Skip cards cannot be used in phases
    if (cards.some(c => c.type === 'skip')) {
      return { valid: false, error: 'Skip cards cannot be used in phases' };
    }

    let groupValid;
    switch (groupDef.type) {
      case 'set':
        groupValid = validateSet(cards);
        break;
      case 'run':
        groupValid = validateRun(cards);
        break;
      case 'color':
        groupValid = validateColorGroup(cards);
        break;
      default:
        return { valid: false, error: `Unknown group type: ${groupDef.type}` };
    }

    if (!groupValid.valid) {
      return { valid: false, error: `Group ${i + 1}: ${groupValid.error}` };
    }
  }

  return { valid: true, resolvedGroups: cardGroups };
}

/**
 * Validate a set (N cards of the same number).
 * Wild cards can substitute for any number.
 * @param {Card[]} cards
 * @returns {ValidationResult}
 */
export function validateSet(cards) {
  const nonWilds = cards.filter(c => c.type !== 'wild');

  if (nonWilds.length === 0) {
    // All wilds — valid set (they can represent any number)
    return { valid: true };
  }

  // All non-wild cards must have the same number
  const targetNumber = nonWilds[0].number;
  const allSameNumber = nonWilds.every(c => c.number === targetNumber);

  if (!allSameNumber) {
    return { valid: false, error: 'Not all cards have the same number' };
  }

  return { valid: true };
}

/**
 * Validate a run (N consecutive numbers).
 * Wild cards fill gaps in the sequence. Numbers range 1-12, no wrapping.
 * @param {Card[]} cards
 * @returns {ValidationResult}
 */
export function validateRun(cards) {
  const wilds = cards.filter(c => c.type === 'wild');
  const numbers = cards.filter(c => c.type === 'number');

  if (numbers.length === 0) {
    // All wilds — valid run (they can represent any consecutive sequence)
    return { valid: true };
  }

  // Sort number cards ascending
  const sorted = [...numbers].sort((a, b) => a.number - b.number);

  // Check for duplicate numbers (can't have two 5s in a run)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].number === sorted[i - 1].number) {
      return { valid: false, error: 'Duplicate numbers in run' };
    }
  }

  // Calculate gaps that need to be filled by wilds
  let wildsNeeded = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].number - sorted[i - 1].number - 1;
    wildsNeeded += gap;
  }

  // Check if we have enough wilds to fill all gaps
  if (wildsNeeded > wilds.length) {
    return { valid: false, error: 'Not enough Wild cards to complete the run' };
  }

  // Check that the total span fits within 1-12
  const minNumber = sorted[0].number;
  const maxNumber = sorted[sorted.length - 1].number;
  const spanWithWilds = maxNumber - minNumber + 1;
  const extraWilds = wilds.length - wildsNeeded;

  // Extra wilds extend the run at either end
  // Check total length matches card count
  const totalLength = spanWithWilds + extraWilds;
  if (totalLength !== cards.length) {
    // This shouldn't happen if count is enforced, but safety check
    return { valid: false, error: 'Run length mismatch' };
  }

  // Verify the extended run stays within 1-12
  // Extra wilds can extend left or right — check if at least one valid placement exists
  const minPossibleStart = Math.max(1, minNumber - extraWilds);
  const maxPossibleEnd = Math.min(12, maxNumber + extraWilds);
  const possibleLength = maxPossibleEnd - minPossibleStart + 1;

  if (possibleLength < cards.length) {
    return { valid: false, error: 'Run would exceed valid range (1-12)' };
  }

  return { valid: true };
}

/**
 * Validate a color group (N cards of the same color).
 * Wild cards can substitute for any color.
 * @param {Card[]} cards
 * @returns {ValidationResult}
 */
export function validateColorGroup(cards) {
  const nonWilds = cards.filter(c => c.type !== 'wild');

  if (nonWilds.length === 0) {
    // All wilds — valid color group
    return { valid: true };
  }

  // All non-wild cards must have the same color
  const targetColor = nonWilds[0].color;
  const allSameColor = nonWilds.every(c => c.color === targetColor);

  if (!allSameColor) {
    return { valid: false, error: 'Not all cards have the same color' };
  }

  return { valid: true };
}

/**
 * Validate a hit (adding a card to an existing laid-down group).
 * @param {Card} card - Card to add
 * @param {Card[]} targetGroup - Existing laid-down group
 * @param {PhaseGroup} groupDef - The group's original definition (type)
 * @returns {boolean} Whether the hit is valid
 */
export function validateHit(card, targetGroup, groupDef) {
  // Skip cards cannot be used for hitting
  if (card.type === 'skip') return false;

  // Wild cards can always be added
  if (card.type === 'wild') return true;

  switch (groupDef.type) {
    case 'set': {
      // Card must match the set's number
      const nonWilds = targetGroup.filter(c => c.type !== 'wild');
      if (nonWilds.length === 0) return true; // All wilds — any number fits
      return card.number === nonWilds[0].number;
    }
    case 'run': {
      // Card must extend the run at either end
      const numbers = getAllRunNumbers(targetGroup);
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      return (card.number === min - 1 && min - 1 >= 1) ||
             (card.number === max + 1 && max + 1 <= 12);
    }
    case 'color': {
      // Card must match the color
      const nonWilds = targetGroup.filter(c => c.type !== 'wild');
      if (nonWilds.length === 0) return true; // All wilds — any color fits
      return card.color === nonWilds[0].color;
    }
    default:
      return false;
  }
}

/**
 * Get all numbers represented in a run (including Wild positions).
 * @param {Card[]} runGroup - A laid-down run group
 * @returns {number[]} All numbers in the run sequence
 */
function getAllRunNumbers(runGroup) {
  const numbers = runGroup.filter(c => c.type === 'number').map(c => c.number);
  if (numbers.length === 0) return [];

  numbers.sort((a, b) => a - b);

  // Fill in the full sequence including wild positions
  const min = numbers[0];
  const totalCards = runGroup.length;
  const result = [];
  for (let i = 0; i < totalCards; i++) {
    result.push(min + i);
  }
  return result;
}

/**
 * Find possible valid phase combinations in a hand (for UI hints).
 * Returns groups of cards that could form a valid phase.
 * @param {Card[]} hand - Player's current hand
 * @param {number} phaseNumber - Target phase number
 * @returns {Card[][] | null} Valid card groups or null if not possible
 */
export function findValidCombinations(hand, phaseNumber) {
  const definition = getPhaseDefinition(phaseNumber);
  if (!definition) return null;

  // Simple heuristic check: is it even theoretically possible?
  const totalCardsNeeded = definition.groups.reduce((sum, g) => sum + g.count, 0);
  if (hand.length < totalCardsNeeded) return null;

  // For single-group phases, try direct validation
  if (definition.groups.length === 1) {
    const group = definition.groups[0];
    const candidates = findGroupCandidates(hand, group);
    if (candidates) return [candidates];
    return null;
  }

  // For multi-group phases, try combinations
  // This is a simplified search — tries the most obvious groupings
  const group1Def = definition.groups[0];
  const group2Def = definition.groups[1];

  const group1Candidates = findAllGroupCandidates(hand, group1Def);

  for (const g1 of group1Candidates) {
    const remainingCards = hand.filter(c => !g1.some(g1c => g1c.id === c.id));
    const g2 = findGroupCandidates(remainingCards, group2Def);
    if (g2) return [g1, g2];
  }

  return null;
}

/**
 * Find a single valid group of cards matching a group definition.
 * @param {Card[]} available - Available cards
 * @param {PhaseGroup} groupDef - Group requirement
 * @returns {Card[] | null}
 */
function findGroupCandidates(available, groupDef) {
  const results = findAllGroupCandidates(available, groupDef);
  return results.length > 0 ? results[0] : null;
}

/**
 * Find all possible valid groups for a group definition.
 * @param {Card[]} available - Available cards
 * @param {PhaseGroup} groupDef - Group requirement
 * @returns {Card[][]}
 */
function findAllGroupCandidates(available, groupDef) {
  const wilds = available.filter(c => c.type === 'wild');
  const numberCards = available.filter(c => c.type === 'number');
  const results = [];

  switch (groupDef.type) {
    case 'set': {
      // Group by number, find sets with enough cards + wilds
      const byNumber = {};
      for (const card of numberCards) {
        if (!byNumber[card.number]) byNumber[card.number] = [];
        byNumber[card.number].push(card);
      }

      for (const [, cards] of Object.entries(byNumber)) {
        const needed = groupDef.count - cards.length;
        if (needed <= wilds.length && needed >= 0) {
          results.push([...cards.slice(0, groupDef.count), ...wilds.slice(0, Math.max(0, needed))].slice(0, groupDef.count));
        }
      }
      break;
    }
    case 'run': {
      // Find consecutive sequences
      const sorted = [...numberCards].sort((a, b) => a.number - b.number);
      const unique = [];
      const seen = new Set();
      for (const card of sorted) {
        if (!seen.has(card.number)) {
          seen.add(card.number);
          unique.push(card);
        }
      }

      // Try starting points
      for (let start = 1; start <= 12 - groupDef.count + 1; start++) {
        const runCards = [];
        let wildsUsed = 0;
        let valid = true;

        for (let n = start; n < start + groupDef.count; n++) {
          const card = unique.find(c => c.number === n);
          if (card) {
            runCards.push(card);
          } else if (wildsUsed < wilds.length) {
            runCards.push(wilds[wildsUsed]);
            wildsUsed++;
          } else {
            valid = false;
            break;
          }
        }

        if (valid && runCards.length === groupDef.count) {
          results.push(runCards);
        }
      }
      break;
    }
    case 'color': {
      // Group by color
      const byColor = {};
      for (const card of numberCards) {
        if (!byColor[card.color]) byColor[card.color] = [];
        byColor[card.color].push(card);
      }

      for (const [, cards] of Object.entries(byColor)) {
        const needed = groupDef.count - cards.length;
        if (needed <= wilds.length && needed >= 0) {
          results.push([...cards.slice(0, groupDef.count), ...wilds.slice(0, Math.max(0, needed))].slice(0, groupDef.count));
        }
      }
      break;
    }
  }

  return results;
}
