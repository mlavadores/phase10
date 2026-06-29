/**
 * Phase 10 — Game State Module
 * 
 * Manages the centralized game state: creation, snapshots (undo),
 * state transitions, phase advancement, and round dealing.
 */

/** @typedef {import('../types.js').Card} Card */
/** @typedef {import('../types.js').Player} Player */
/** @typedef {import('../types.js').GameState} GameState */
/** @typedef {import('../types.js').GameConfig} GameConfig */

import { dealRound } from './deck.js';

/**
 * Generate a unique ID.
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/**
 * Create the initial game state for a new game.
 * @param {GameConfig} config - Game configuration
 * @returns {GameState}
 */
export function createInitialState(config) {
  const { hands, drawPile, discardPile } = dealRound(2);

  /** @type {Player[]} */
  const players = [
    {
      id: generateId(),
      name: config.playerNames[0],
      hand: hands[0],
      currentPhase: 1,
      hasLaidDown: false,
      laidDownGroups: [],
      score: 0,
      isAI: false,
      difficulty: null,
      isSkipped: false
    },
    {
      id: generateId(),
      name: config.playerNames[1],
      hand: hands[1],
      currentPhase: 1,
      hasLaidDown: false,
      laidDownGroups: [],
      score: 0,
      isAI: config.mode === 'ai',
      difficulty: config.mode === 'ai' ? config.difficulty : null,
      isSkipped: false
    }
  ];

  return {
    id: generateId(),
    players,
    currentPlayerIndex: 0,
    drawPile,
    discardPile,
    round: 1,
    turnPhase: 'draw',
    phaseList: config.phaseList || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    gameOver: false,
    winner: null,
    lastAction: null,
    undoSnapshot: null,
    config,
    drawnCard: null,
    drawnFrom: null
  };
}

/**
 * Create a deep copy of the game state for undo support.
 * Excludes undoSnapshot to avoid infinite nesting.
 * @param {GameState} state
 * @returns {GameState}
 */
export function getSnapshot(state) {
  const snapshot = JSON.parse(JSON.stringify(state));
  // Clear nested undo to prevent deep chains
  snapshot.undoSnapshot = null;
  return snapshot;
}

/**
 * Restore a previously saved snapshot.
 * @param {GameState} snapshot - Snapshot to restore
 * @returns {GameState}
 */
export function restoreSnapshot(snapshot) {
  return {
    ...snapshot,
    undoSnapshot: null,
    lastAction: null
  };
}

/**
 * Advance a player to the next phase in the phase list.
 * Called at end of round for players who successfully laid down.
 * @param {GameState} state
 * @param {string} playerId
 * @returns {GameState}
 */
export function advancePhase(state, playerId) {
  const players = state.players.map(player => {
    if (player.id !== playerId) return player;
    return {
      ...player,
      currentPhase: player.currentPhase + 1
    };
  });

  return { ...state, players };
}

/**
 * Advance to the next player's turn.
 * Handles skipped players.
 * @param {GameState} state
 * @returns {GameState}
 */
export function nextTurn(state) {
  let nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  let players = [...state.players];

  // Check if next player is skipped
  if (players[nextIndex].isSkipped) {
    players = players.map((p, i) => {
      if (i === nextIndex) return { ...p, isSkipped: false };
      return p;
    });
    // Skip that player, move to next
    nextIndex = (nextIndex + 1) % players.length;
  }

  return {
    ...state,
    players,
    currentPlayerIndex: nextIndex,
    turnPhase: 'draw',
    drawnCard: null,
    drawnFrom: null,
    lastAction: null,
    undoSnapshot: null
  };
}

/**
 * Deal a new round: reshuffle, deal cards, reset per-round player flags.
 * @param {GameState} state
 * @returns {GameState}
 */
export function dealNewRound(state) {
  const { hands, drawPile, discardPile } = dealRound(state.players.length);

  const players = state.players.map((player, idx) => ({
    ...player,
    hand: hands[idx],
    hasLaidDown: false,
    laidDownGroups: [],
    isSkipped: false
  }));

  return {
    ...state,
    players,
    drawPile,
    discardPile,
    round: state.round + 1,
    turnPhase: 'draw',
    currentPlayerIndex: 0,
    drawnCard: null,
    drawnFrom: null,
    lastAction: null,
    undoSnapshot: null
  };
}

/**
 * Mark a player as having laid down their phase this round.
 * @param {GameState} state
 * @param {string} playerId
 * @param {Card[][]} groups - The card groups laid down
 * @returns {GameState}
 */
export function layDownPhase(state, playerId, groups) {
  const players = state.players.map(player => {
    if (player.id !== playerId) return player;

    // Remove laid-down cards from hand
    const laidCardIds = new Set(groups.flat().map(c => c.id));
    const hand = player.hand.filter(c => !laidCardIds.has(c.id));

    return {
      ...player,
      hand,
      hasLaidDown: true,
      laidDownGroups: groups
    };
  });

  return { ...state, players };
}

/**
 * Add a card to an existing laid-down group (hitting).
 * @param {GameState} state
 * @param {string} hittingPlayerId - Player performing the hit
 * @param {string} targetPlayerId - Player whose group is being hit
 * @param {number} groupIndex - Index of the group to add to
 * @param {Card} card - Card to add
 * @returns {GameState}
 */
export function addHit(state, hittingPlayerId, targetPlayerId, groupIndex, card) {
  const players = state.players.map(player => {
    const isHitter = player.id === hittingPlayerId;
    const isTarget = player.id === targetPlayerId;

    if (!isHitter && !isTarget) return player;

    let updatedPlayer = { ...player };

    // Remove card from hitter's hand
    if (isHitter) {
      updatedPlayer.hand = player.hand.filter(c => c.id !== card.id);
    }

    // Add card to target's laid-down group
    if (isTarget) {
      updatedPlayer.laidDownGroups = player.laidDownGroups.map((group, idx) => {
        if (idx === groupIndex) return [...group, card];
        return group;
      });
    }

    return updatedPlayer;
  });

  return { ...state, players };
}

/**
 * Mark the opponent as skipped (when a Skip card is discarded).
 * @param {GameState} state
 * @param {string} targetPlayerId - Player to skip
 * @returns {GameState}
 */
export function skipPlayer(state, targetPlayerId) {
  const players = state.players.map(player => {
    if (player.id !== targetPlayerId) return player;
    return { ...player, isSkipped: true };
  });

  return { ...state, players };
}

/**
 * Get the current player object.
 * @param {GameState} state
 * @returns {Player}
 */
export function getCurrentPlayer(state) {
  return state.players[state.currentPlayerIndex];
}

/**
 * Get the opponent player object.
 * @param {GameState} state
 * @returns {Player}
 */
export function getOpponent(state) {
  const opponentIndex = (state.currentPlayerIndex + 1) % state.players.length;
  return state.players[opponentIndex];
}

/**
 * Set the turn phase.
 * @param {GameState} state
 * @param {import('../types.js').TurnPhase} turnPhase
 * @returns {GameState}
 */
export function setTurnPhase(state, turnPhase) {
  return { ...state, turnPhase };
}

/**
 * Add a card to the current player's hand (after drawing).
 * @param {GameState} state
 * @param {Card} card
 * @returns {GameState}
 */
export function addCardToHand(state, card) {
  const players = state.players.map((player, idx) => {
    if (idx !== state.currentPlayerIndex) return player;
    return { ...player, hand: [...player.hand, card] };
  });

  return { ...state, players };
}
