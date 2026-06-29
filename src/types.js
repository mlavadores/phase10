/**
 * Phase 10 — Shared Type Definitions (JSDoc)
 * 
 * This module defines all shared data types used across the application.
 * Types are documented via JSDoc for IDE support without TypeScript.
 */

/**
 * @typedef {'red' | 'blue' | 'green' | 'yellow'} CardColor
 */

/**
 * @typedef {'number' | 'wild' | 'skip'} CardType
 */

/**
 * @typedef {Object} Card
 * @property {string} id - Unique identifier (e.g., "r7-1", "wild-3", "skip-2")
 * @property {CardType} type - Card type
 * @property {number | null} number - 1-12 for number cards, null for wild/skip
 * @property {CardColor | null} color - Card color, null for wild/skip
 */

/**
 * @typedef {'easy' | 'hard'} AIDifficulty
 */

/**
 * @typedef {Object} Player
 * @property {string} id - Unique player ID
 * @property {string} name - Display name
 * @property {Card[]} hand - Current cards in hand
 * @property {number} currentPhase - 1-based index into phaseList (which phase they're working on)
 * @property {boolean} hasLaidDown - Whether they laid down their phase this round
 * @property {Card[][]} laidDownGroups - Card groups laid on table after phase completion
 * @property {number} score - Cumulative score (penalty points)
 * @property {boolean} isAI - Whether this is an AI player
 * @property {AIDifficulty | null} difficulty - AI difficulty (null for human)
 * @property {boolean} isSkipped - Whether this player's next turn is skipped
 */

/**
 * @typedef {'draw' | 'action' | 'discard'} TurnPhase
 */

/**
 * @typedef {'ai' | 'online'} GameMode
 */

/**
 * @typedef {Object} GameConfig
 * @property {GameMode} mode - Game mode
 * @property {AIDifficulty | null} difficulty - AI difficulty (null for online)
 * @property {[string, string]} playerNames - Display names for both players
 * @property {number[]} phaseList - Phase order (default [1..10] or custom)
 * @property {string | null} customPhaseListId - ID of custom phase list used (null for default)
 */

/**
 * @typedef {Object} GameState
 * @property {string} id - Game session ID
 * @property {Player[]} players - Array of 2 players
 * @property {number} currentPlayerIndex - 0 or 1
 * @property {Card[]} drawPile - Face-down draw pile
 * @property {Card[]} discardPile - Face-up discard pile (last element = top card)
 * @property {number} round - Current round number (1+)
 * @property {TurnPhase} turnPhase - Current turn step
 * @property {number[]} phaseList - Phase order being used
 * @property {boolean} gameOver - Whether game has ended
 * @property {string | null} winner - Winner player ID (null if ongoing)
 * @property {PlayerAction | null} lastAction - Last action performed (for undo)
 * @property {GameState | null} undoSnapshot - Previous state snapshot (for undo)
 * @property {GameConfig} config - Session configuration
 * @property {Card | null} drawnCard - Card drawn this turn (to enforce discard rule TR-4)
 * @property {'pile' | 'discard' | null} drawnFrom - Where the card was drawn from
 */

/**
 * @typedef {'set' | 'run' | 'color'} PhaseGroupType
 */

/**
 * @typedef {Object} PhaseGroup
 * @property {PhaseGroupType} type - Group type
 * @property {number} count - Number of cards required in this group
 */

/**
 * @typedef {Object} PhaseDefinition
 * @property {number} phaseNumber - 1-10
 * @property {string} description - Human-readable description
 * @property {PhaseGroup[]} groups - Required groups for this phase
 */

/**
 * @typedef {'draw' | 'discard' | 'laydown' | 'hit' | 'skip-target'} ActionType
 */

/**
 * @typedef {Object} PlayerAction
 * @property {ActionType} type - Action type
 * @property {string} playerId - Player performing the action
 * @property {Object} payload - Action-specific data
 * @property {'pile' | 'discard'} [payload.source] - For draw actions
 * @property {Card} [payload.card] - For discard and hit actions
 * @property {Card[][]} [payload.groups] - For laydown actions (card groups)
 * @property {string} [payload.targetPlayerId] - For hit actions
 * @property {number} [payload.targetGroupIndex] - For hit actions
 */

/**
 * @typedef {'action' | 'state-update' | 'join' | 'ready' | 'disconnect' | 'reconnect' | 'error'} MessageType
 */

/**
 * @typedef {Object} GameMessage
 * @property {MessageType} type - Message type
 * @property {PlayerAction | GameState | Object} payload - Message payload
 * @property {number} timestamp - Unix timestamp
 */

/**
 * @typedef {Object} GameResult
 * @property {string} id - Unique result ID
 * @property {string} date - ISO timestamp
 * @property {Array<{name: string, score: number, finalPhase: number}>} players - Player results
 * @property {string} winnerId - Winner player ID
 * @property {number} rounds - Total rounds played
 * @property {number[]} phaseList - Phase list used
 * @property {GameMode} mode - Game mode
 * @property {AIDifficulty | null} difficulty - AI difficulty if applicable
 */

/**
 * @typedef {Object} PhaseList
 * @property {string} id - Unique list ID
 * @property {string} name - User-given name
 * @property {number[]} phases - Array of phase numbers in custom order
 * @property {string} createdAt - ISO timestamp
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the validation passed
 * @property {string} [error] - Error message if invalid
 * @property {Card[][]} [resolvedGroups] - The validated card groups with Wilds assigned
 */

/**
 * @typedef {Object} HitAction
 * @property {Card} card - Card to hit with
 * @property {string} targetPlayerId - Target player's ID
 * @property {number} targetGroupIndex - Index of the target group
 */

/**
 * @typedef {Object} Settings
 * @property {string} playerName - Preferred player name
 * @property {boolean} soundEnabled - Sound effects toggle
 * @property {boolean} animationsEnabled - Animations toggle
 */

// Export nothing — this file is for JSDoc type reference only
export {};
