/**
 * Phase 10 — Settings Store Module
 * 
 * Persists user preferences (display name, sound, animations).
 */

/** @typedef {import('../types.js').Settings} Settings */

const STORAGE_KEY = 'phase10_settings';

/** @type {Settings} */
const DEFAULT_SETTINGS = {
  playerName: 'Player',
  soundEnabled: true,
  animationsEnabled: true
};

/**
 * Save settings to localStorage.
 * @param {Settings} settings
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

/**
 * Load settings from localStorage.
 * Returns defaults if nothing is saved.
 * @returns {Settings}
 */
export function getSettings() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(serialized) };
  } catch (e) {
    console.warn('Failed to load settings:', e);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Update a single setting value.
 * @param {keyof Settings} key
 * @param {any} value
 */
export function updateSetting(key, value) {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
}

/**
 * Reset settings to defaults.
 */
export function resetSettings() {
  saveSettings({ ...DEFAULT_SETTINGS });
}

/**
 * Clear all stored data (settings, saved games, history, phase lists).
 * Used by "Clear All Data" option in settings.
 */
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('phase10_saved_game');
    localStorage.removeItem('phase10_game_history');
    localStorage.removeItem('phase10_custom_phase_lists');
  } catch (e) {
    console.warn('Failed to clear all data:', e);
  }
}
