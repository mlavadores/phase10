/**
 * Phase 10 — Game Engine (Barrel Export)
 * 
 * Re-exports all game engine modules for clean imports.
 * Usage: import { createDeck, validatePhase, scoreHand } from './game-engine/index.js';
 */

export {
  createDeck,
  shuffle,
  drawFromPile,
  drawFromDiscard,
  discard,
  reshuffleDiscard,
  dealRound
} from './deck.js';

export {
  PHASE_DEFINITIONS,
  getPhaseDefinition,
  validatePhase,
  validateSet,
  validateRun,
  validateColorGroup,
  validateHit,
  findValidCombinations
} from './phase-validator.js';

export {
  createInitialState,
  getSnapshot,
  restoreSnapshot,
  advancePhase,
  nextTurn,
  dealNewRound,
  layDownPhase,
  addHit,
  skipPlayer,
  getCurrentPlayer,
  getOpponent,
  setTurnPhase,
  addCardToHand
} from './game-state.js';

export {
  scoreHand,
  updateScores,
  getWinner,
  getScoreBreakdown
} from './scoring.js';

export {
  isValidDraw,
  isValidDiscard,
  canLayDownPhase,
  canHit,
  isRoundOver,
  isGameOver,
  isPlayerTurn,
  canUndo,
  getPlayerPhaseNumber
} from './rules.js';
