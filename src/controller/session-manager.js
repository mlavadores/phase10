/**
 * Phase 10 — Session Manager
 * 
 * Manages game session lifecycle: creating AI games, hosting/joining online,
 * and P2P connection setup via PeerJS.
 */

/** @typedef {import('../types.js').GameConfig} GameConfig */
/** @typedef {import('../types.js').GameState} GameState */

import { PeerConnection } from '../networking/peer-connection.js';
import { DataChannel } from '../networking/data-channel.js';
import { GameSync } from '../networking/sync.js';
import { createInitialState } from '../game-engine/game-state.js';

/**
 * @typedef {'idle' | 'waiting' | 'connected' | 'playing'} SessionState
 */

export class SessionManager {
  constructor() {
    /** @type {PeerConnection | null} */
    this._peer = null;
    /** @type {DataChannel | null} */
    this._channel = null;
    /** @type {GameSync | null} */
    this._sync = null;
    /** @type {SessionState} */
    this._state = 'idle';
    /** @type {'ai' | 'online' | null} */
    this._mode = null;
    /** @type {boolean} */
    this._isHost = false;
  }

  /**
   * Start a new AI game session.
   * @param {string} playerName
   * @param {import('../types.js').AIDifficulty} difficulty
   * @param {number[]} [phaseList]
   * @returns {GameState}
   */
  startAIGame(playerName, difficulty, phaseList) {
    this._mode = 'ai';
    this._state = 'playing';
    this._isHost = true;

    /** @type {GameConfig} */
    const config = {
      mode: 'ai',
      difficulty,
      playerNames: [playerName, `AI (${difficulty})`],
      phaseList: phaseList || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      customPhaseListId: null
    };

    return createInitialState(config);
  }

  /**
   * Create an online game as host.
   * @param {string} playerName
   * @returns {Promise<{roomCode: string, onPlayerJoined: (handler: Function) => void}>}
   */
  async createOnlineSession(playerName) {
    this._mode = 'online';
    this._isHost = true;
    this._state = 'waiting';

    this._peer = new PeerConnection();
    const roomCode = await this._peer.createHost();

    this._peer.onStateChange((state) => {
      if (state === 'connected') {
        this._channel = new DataChannel(this._peer);
        this._sync = new GameSync(this._channel, true);
      }
    });

    return {
      roomCode,
      /**
       * Register handler for when opponent joins.
       * @param {(opponentName: string) => void} handler
       */
      onPlayerJoined: (handler) => {
        // Wait for connection, then listen for join message
        const checkSync = setInterval(() => {
          if (this._sync) {
            clearInterval(checkSync);
            this._sync.onPlayerJoined((opponentName) => {
              this._state = 'playing';
              handler(opponentName);
            });
          }
        }, 100);
      }
    };
  }

  /**
   * Join an online game as guest.
   * @param {string} playerName
   * @param {string} roomCode
   * @returns {Promise<void>}
   */
  async joinOnlineSession(playerName, roomCode) {
    this._mode = 'online';
    this._isHost = false;
    this._state = 'connecting';

    this._peer = new PeerConnection();
    await this._peer.joinGame(roomCode);

    this._channel = new DataChannel(this._peer);
    this._sync = new GameSync(this._channel, false);

    // Do NOT send join message here — controller will do it after registering handlers
    this._state = 'playing';
  }

  /**
   * Send the join message to host (called AFTER handlers are registered).
   * @param {string} playerName
   */
  sendJoinMessage(playerName) {
    if (this._channel) {
      this._channel.sendJoin(playerName);
    }
  }

  /**
   * Initialize an online game state (host creates it after both players join).
   * @param {string} hostName
   * @param {string} guestName
   * @param {number[]} [phaseList]
   * @returns {GameState}
   */
  createOnlineGameState(hostName, guestName, phaseList) {
    /** @type {GameConfig} */
    const config = {
      mode: 'online',
      difficulty: null,
      playerNames: [hostName, guestName],
      phaseList: phaseList || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      customPhaseListId: null
    };

    return createInitialState(config);
  }

  /**
   * Get the sync module for networking.
   * @returns {GameSync | null}
   */
  getSync() {
    return this._sync;
  }

  /**
   * Get current session mode.
   * @returns {'ai' | 'online' | null}
   */
  getMode() {
    return this._mode;
  }

  /**
   * Check if this client is the host.
   * @returns {boolean}
   */
  isHost() {
    return this._isHost;
  }

  /**
   * Get session state.
   * @returns {SessionState}
   */
  getState() {
    return this._state;
  }

  /**
   * Close the session and clean up networking.
   */
  destroy() {
    if (this._sync) {
      this._sync.destroy();
      this._sync = null;
    }
    if (this._peer) {
      this._peer.close();
      this._peer = null;
    }
    this._channel = null;
    this._mode = null;
    this._state = 'idle';
  }
}
