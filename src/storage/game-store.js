/**
 * Phase 10 — Game Store Module
 * 
 * Persists in-progress game state to localStorage for save/resume.
 * Only AI games are saved (online games are not persisted per PS-2).
 */

/** @typedef {import('../types.js').GameState} GameState */

const STORAGE_KEY = 'phase10_saved_game';

/**
 * Save the current game state to localStorage.
 * Only saves AI games (PS-1).
 * @param {GameState} state
 * @returns {boolean} Whether the save was successful
 */
export function saveGame(state) {
  // Only save AI games (PS-1, PS-2)
  if (state.config.mode === 'online') return false;

  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (e) {
    console.warn('Failed to save game state:', e);
    return false;
  }
}

/**
 * Load a saved game state from localStorage.
 * @returns {GameState | null} Saved state or null if none exists
 */
export function loadGame() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized);
  } catch (e) {
    console.warn('Failed to load saved game:', e);
    return null;
  }
}

/**
 * Check if a saved game exists in localStorage.
 * @returns {boolean}
 */
export function hasSavedGame() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (e) {
    return false;
  }
}

/**
 * Delete the saved game from localStorage.
 */
export function clearSavedGame() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear saved game:', e);
  }
}
