/**
 * Phase 10 — History Store Module
 * 
 * Stores completed game records in localStorage.
 * Only completed games are recorded (PS-4).
 */

/** @typedef {import('../types.js').GameResult} GameResult */

const STORAGE_KEY = 'phase10_game_history';
const MAX_HISTORY = 100;

/**
 * Add a completed game result to history.
 * @param {GameResult} result
 */
export function addGameResult(result) {
  try {
    const history = getHistory();
    history.unshift(result); // Most recent first

    // Cap history at MAX_HISTORY entries
    if (history.length > MAX_HISTORY) {
      history.length = MAX_HISTORY;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save game result:', e);
  }
}

/**
 * Retrieve all past game results.
 * @returns {GameResult[]} Array of game results, most recent first
 */
export function getHistory() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return [];
    return JSON.parse(serialized);
  } catch (e) {
    console.warn('Failed to load game history:', e);
    return [];
  }
}

/**
 * Delete all game history.
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear game history:', e);
  }
}

/**
 * Get total number of games played.
 * @returns {number}
 */
export function getGamesPlayed() {
  return getHistory().length;
}

/**
 * Get win/loss stats.
 * @param {string} playerName - Player name to check stats for
 * @returns {{wins: number, losses: number, totalGames: number}}
 */
export function getPlayerStats(playerName) {
  const history = getHistory();
  let wins = 0;
  let losses = 0;

  for (const game of history) {
    const playerResult = game.players.find(p => p.name === playerName);
    if (!playerResult) continue;

    const winner = game.players.find(p =>
      game.winnerId === p.name || game.players.indexOf(p) === 0
    );

    // Check by winnerId matching
    if (game.winnerId === playerName) {
      wins++;
    } else {
      losses++;
    }
  }

  return { wins, losses, totalGames: wins + losses };
}
