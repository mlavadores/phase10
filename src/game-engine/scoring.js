/**
 * Phase 10 — Scoring Module
 * 
 * Calculates penalty points for cards remaining in hand at round end.
 * Determines game winner.
 */

/** @typedef {import('../types.js').Card} Card */
/** @typedef {import('../types.js').Player} Player */
/** @typedef {import('../types.js').GameState} GameState */

/**
 * Calculate penalty points for cards remaining in a player's hand.
 * - Cards 1-9: 5 points each
 * - Cards 10-12: 10 points each
 * - Skip cards: 15 points each
 * - Wild cards: 25 points each
 * @param {Card[]} hand - Cards remaining in hand
 * @returns {number} Total penalty points
 */
export function scoreHand(hand) {
  let total = 0;

  for (const card of hand) {
    switch (card.type) {
      case 'number':
        total += card.number <= 9 ? 5 : 10;
        break;
      case 'skip':
        total += 15;
        break;
      case 'wild':
        total += 25;
        break;
    }
  }

  return total;
}

/**
 * Apply end-of-round scoring to all players.
 * Adds penalty points from remaining hand cards to cumulative scores.
 * @param {GameState} state
 * @returns {{state: GameState, roundScores: number[]}}
 */
export function updateScores(state) {
  const roundScores = [];

  const players = state.players.map(player => {
    const penalty = scoreHand(player.hand);
    roundScores.push(penalty);
    return {
      ...player,
      score: player.score + penalty
    };
  });

  return {
    state: { ...state, players },
    roundScores
  };
}

/**
 * Determine the game winner after all phases are complete.
 * - Player who completed all phases wins
 * - If both completed in same round: lowest cumulative score wins
 * - If scores tied: game is a draw (returns first player as winner)
 * @param {GameState} state
 * @returns {Player | null} Winner player or null if game not over
 */
export function getWinner(state) {
  if (!state.gameOver) return null;

  const totalPhases = state.phaseList.length;

  // Find players who completed all phases
  const completedPlayers = state.players.filter(
    p => p.currentPhase > totalPhases
  );

  if (completedPlayers.length === 0) return null;

  if (completedPlayers.length === 1) {
    return completedPlayers[0];
  }

  // Tie-break: lowest score wins
  completedPlayers.sort((a, b) => a.score - b.score);
  return completedPlayers[0];
}

/**
 * Get a breakdown of scoring for display purposes.
 * @param {Card[]} hand
 * @returns {Array<{card: Card, points: number}>}
 */
export function getScoreBreakdown(hand) {
  return hand.map(card => {
    let points = 0;
    switch (card.type) {
      case 'number':
        points = card.number <= 9 ? 5 : 10;
        break;
      case 'skip':
        points = 15;
        break;
      case 'wild':
        points = 25;
        break;
    }
    return { card, points };
  });
}
