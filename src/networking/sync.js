/**
 * Phase 10 — Sync Module
 * 
 * State synchronization protocol between host and guest.
 * Host is authoritative — guest sends actions, receives validated state.
 */

/** @typedef {import('../types.js').GameState} GameState */
/** @typedef {import('../types.js').PlayerAction} PlayerAction */
/** @typedef {import('../types.js').GameMessage} GameMessage */

import { DataChannel } from './data-channel.js';

/**
 * GameSync manages the synchronization protocol between peers.
 */
export class GameSync {
  /**
   * @param {DataChannel} dataChannel
   * @param {boolean} isHost
   */
  constructor(dataChannel, isHost) {
    /** @type {DataChannel} */
    this.channel = dataChannel;
    /** @type {boolean} */
    this.isHost = isHost;
    /** @type {Function | null} */
    this._onActionReceived = null;
    /** @type {Function | null} */
    this._onStateReceived = null;
    /** @type {Function | null} */
    this._onPlayerJoined = null;
    /** @type {Function | null} */
    this._onError = null;

    this._setupHandlers();
  }

  /**
   * Host: broadcast updated state to guest after processing an action.
   * @param {GameState} state
   */
  broadcastState(state) {
    if (!this.isHost) {
      console.warn('Only host can broadcast state');
      return;
    }
    this.channel.sendStateUpdate(state);
  }

  /**
   * Guest: send a player action to the host for validation.
   * @param {PlayerAction} action
   */
  sendAction(action) {
    if (this.isHost) {
      console.warn('Host should not send actions to itself');
      return;
    }
    this.channel.sendAction(action);
  }

  /**
   * Set handler for when an action is received (host receives from guest).
   * @param {(action: PlayerAction) => void} handler
   */
  onActionReceived(handler) {
    this._onActionReceived = handler;
  }

  /**
   * Set handler for when state update is received (guest receives from host).
   * @param {(state: GameState) => void} handler
   */
  onStateReceived(handler) {
    this._onStateReceived = handler;
  }

  /**
   * Set handler for when a player joins (host receives join message).
   * @param {(playerName: string) => void} handler
   */
  onPlayerJoined(handler) {
    this._onPlayerJoined = handler;
  }

  /**
   * Set handler for errors.
   * @param {(error: string) => void} handler
   */
  onError(handler) {
    this._onError = handler;
  }

  /**
   * Set up message handlers based on role (host vs guest).
   * @private
   */
  _setupHandlers() {
    // Host listens for actions and join messages
    if (this.isHost) {
      this.channel.on('action', (payload) => {
        if (this._onActionReceived) {
          this._onActionReceived(payload);
        }
      });

      this.channel.on('join', (payload) => {
        if (this._onPlayerJoined) {
          this._onPlayerJoined(payload.playerName);
        }
      });
    }

    // Guest listens for state updates
    if (!this.isHost) {
      this.channel.on('state-update', (payload) => {
        if (this._onStateReceived) {
          this._onStateReceived(payload);
        }
      });
    }

    // Both listen for errors
    this.channel.on('error', (payload) => {
      if (this._onError) {
        this._onError(payload.error);
      }
    });
  }

  /**
   * Clean up handlers.
   */
  destroy() {
    this._onActionReceived = null;
    this._onStateReceived = null;
    this._onPlayerJoined = null;
    this._onError = null;
  }
}
