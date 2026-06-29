/**
 * Phase 10 — Storage (Barrel Export)
 * 
 * Re-exports all storage modules for clean imports.
 * Usage: import { saveGame, loadGame, getHistory } from './storage/index.js';
 */

export {
  saveGame,
  loadGame,
  hasSavedGame,
  clearSavedGame
} from './game-store.js';

export {
  addGameResult,
  getHistory,
  clearHistory,
  getGamesPlayed,
  getPlayerStats
} from './history-store.js';

export {
  savePhaseLists,
  getPhaseLists,
  addPhaseList,
  deletePhaseList,
  updatePhaseList,
  getPhaseListById,
  createPhaseList
} from './phase-list-store.js';

export {
  saveSettings,
  getSettings,
  updateSetting,
  resetSettings,
  clearAllData
} from './settings-store.js';
