/**
 * Phase 10 — Turn Manager
 * 
 * Coordinates turn flow: processes player actions through the game engine,
 * manages undo snapshots, and validates action legality.
 */

/** @typedef {import('../types.js').GameState} GameState */
/** @typedef {import('../types.js').PlayerAction} PlayerAction */
/** @typedef {import('../types.js').Card} Card */

import {
  drawFromPile, drawFromDiscard, discard,
  validatePhase, validateHit, getPhaseDefinition, getPlayerPhaseNumber,
  isValidDraw, isValidDiscard, canLayDownPhase, canHit, isRoundOver,
  getSnapshot, setTurnPhase, addCardToHand, layDownPhase, addHit,
  skipPlayer, nextTurn, getCurrentPlayer
} from '../game-engine/index.js';

/**
 * Process a player action and return the new game state.
 * Returns null if the action is invalid.
 * @param {GameState} state - Current state
 * @param {PlayerAction} action - Action to process
 * @returns {{newState: GameState, valid: boolean, error?: string}}
 */
export function processAction(state, action) {
  switch (action.type) {
    case 'draw':
      return processDraw(state, action);
    case 'discard':
      return processDiscard(state, action);
    case 'laydown':
      return processLayDown(state, action);
    case 'hit':
      return processHit(state, action);
    case 'skip-target':
      return processSkipTarget(state, action);
    default:
      return { newState: state, valid: false, error: `Unknown action: ${action.type}` };
  }
}

/**
 * Process a draw action.
 * @param {GameState} state
 * @param {PlayerAction} action
 * @returns {{newState: GameState, valid: boolean, error?: string}}
 */
function processDraw(state, action) {
  const source = action.payload.source;

  if (!isValidDraw(state, source)) {
    return { newState: state, valid: false, error: 'Invalid draw' };
  }

  // Create undo snapshot before modifying state
  const undoSnapshot = getSnapshot(state);

  let result;
  if (source === 'pile') {
    result = drawFromPile(state);
  } else {
    result = drawFromDiscard(state);
  }

  // Add drawn card to player's hand
  let newState = addCardToHand(result.state, result.card);
  newState = setTurnPhase(newState, 'action');
  newState = {
    ...newState,
    undoSnapshot,
    lastAction: action,
    drawnCard: result.card,
    drawnFrom: source
  };

  return { newState, valid: true };
}

/**
 * Process a discard action.
 * @param {GameState} state
 * @param {PlayerAction} action
 * @returns {{newState: GameState, valid: boolean, error?: string}}
 */
function processDiscard(state, action) {
  const card = action.payload.card;
  const validation = isValidDiscard(state, card);

  if (!validation.valid) {
    return { newState: state, valid: false, error: validation.error };
  }

  // Create undo snapshot
  const undoSnapshot = getSnapshot(state);

  // Perform the discard
  let newState = discard(state, card);
  newState = {
    ...newState,
    turnPhase: 'discard', // Mark turn as ended
    undoSnapshot,
    lastAction: action
  };

  return { newState, valid: true };
}

/**
 * Process a phase lay-down action.
 * @param {GameState} state
 * @param {PlayerAction} action
 * @returns {{newState: GameState, valid: boolean, error?: string}}
 */
function processLayDown(state, action) {
  const playerId = action.playerId;
  const groups = action.payload.groups;

  if (!canLayDownPhase(state, playerId)) {
    return { newState: state, valid: false, error: 'Cannot lay down phase now' };
  }

  // Get the actual phase number from the phase list
  const phaseNumber = getPlayerPhaseNumber(state, playerId);

  // Validate the phase
  const result = validatePhase(groups, phaseNumber);
  if (!result.valid) {
    return { newState: state, valid: false, error: result.error };
  }

  // Create undo snapshot
  const undoSnapshot = getSnapshot(state);

  // Apply the lay-down
  let newState = layDownPhase(state, playerId, groups);
  newState = {
    ...newState,
    undoSnapshot,
    lastAction: action
  };

  return { newState, valid: true };
}

/**
 * Process a hit action.
 * @param {GameState} state
 * @param {PlayerAction} action
 * @returns {{newState: GameState, valid: boolean, error?: string}}
 */
function processHit(state, action) {
  const playerId = action.playerId;
  const { card, targetPlayerId, targetGroupIndex } = action.payload;

  if (!canHit(state, playerId)) {
    return { newState: state, valid: false, error: 'Cannot hit now' };
  }

  // Validate the hit
  const targetPlayer = state.players.find(p => p.id === targetPlayerId);
  if (!targetPlayer || !targetPlayer.laidDownGroups[targetGroupIndex]) {
    return { newState: state, valid: false, error: 'Invalid hit target' };
  }

  const targetGroup = targetPlayer.laidDownGroups[targetGroupIndex];
  const phaseNumber = getPlayerPhaseNumber(state, targetPlayerId);
  const definition = getPhaseDefinition(phaseNumber);

  if (!definition || !definition.groups[targetGroupIndex]) {
    return { newState: state, valid: false, error: 'Invalid phase definition for hit' };
  }

  const groupDef = definition.groups[targetGroupIndex];
  if (!validateHit(card, targetGroup, groupDef)) {
    return { newState: state, valid: false, error: 'Card does not fit this group' };
  }

  // Create undo snapshot
  const undoSnapshot = getSnapshot(state);

  // Apply the hit
  let newState = addHit(state, playerId, targetPlayerId, targetGroupIndex, card);
  newState = {
    ...newState,
    undoSnapshot,
    lastAction: action
  };

  return { newState, valid: true };
}

/**
 * Process a skip-target action (applied when a Skip card is discarded).
 * @param {GameState} state
 * @param {PlayerAction} action
 * @returns {{newState: GameState, valid: boolean, error?: string}}
 */
function processSkipTarget(state, action) {
  const targetPlayerId = action.payload.targetPlayerId;
  const newState = skipPlayer(state, targetPlayerId);
  return { newState, valid: true };
}

/**
 * Perform undo — restore the last snapshot.
 * @param {GameState} state
 * @returns {GameState | null} Restored state, or null if undo not available
 */
export function performUndo(state) {
  if (!state.undoSnapshot) return null;
  return {
    ...state.undoSnapshot,
    undoSnapshot: null,
    lastAction: null
  };
}
