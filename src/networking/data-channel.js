/**
 * Phase 10 — Data Channel Module
 * 
 * Handles message serialization and routing over the PeerJS connection.
 * Provides typed send/receive interface for game messages.
 */

/** @typedef {import('../types.js').GameMessage} GameMessage */
/** @typedef {import('../types.js').PlayerAction} PlayerAction */
/** @typedef {import('../types.js').GameState} GameState */

import { PeerConnection } from './peer-connection.js';

/**
 * DataChannel wraps PeerConnection with typed game message handling.
 */
export class DataChannel {
  /**
   * @param {PeerConnection} peerConnection
   */
  constructor(peerConnection) {
    /** @type {PeerConnection} */
    this.peer = peerConnection;
    /** @type {Map<string, Function[]>} */
    this._handlers = new Map();

    // Route incoming messages by type
    this.peer.onMessage((message) => {
      this._dispatch(message);
    });
  }

  /**
   * Send a game message to the peer.
   * @param {GameMessage} message
   */
  send(message) {
    this.peer.send({
      ...message,
      timestamp: Date.now()
    });
  }

  /**
   * Send a player action (guest → host).
   * @param {PlayerAction} action
   */
  sendAction(action) {
    this.send({
      type: 'action',
      payload: action,
      timestamp: Date.now()
    });
  }

  /**
   * Send a state update (host → guest).
   * @param {GameState} state
   */
  sendStateUpdate(state) {
    // Strip undo snapshot to reduce payload size
    const lightState = { ...state, undoSnapshot: null };
    this.send({
      type: 'state-update',
      payload: lightState,
      timestamp: Date.now()
    });
  }

  /**
   * Send a join message (guest → host).
   * @param {string} playerName
   */
  sendJoin(playerName) {
    this.send({
      type: 'join',
      payload: { playerName },
      timestamp: Date.now()
    });
  }

  /**
   * Send a ready signal.
   */
  sendReady() {
    this.send({
      type: 'ready',
      payload: {},
      timestamp: Date.now()
    });
  }

  /**
   * Send an error message.
   * @param {string} error
   */
  sendError(error) {
    this.send({
      type: 'error',
      payload: { error },
      timestamp: Date.now()
    });
  }

  /**
   * Register a handler for a specific message type.
   * @param {string} type - Message type to listen for
   * @param {Function} handler - Callback function
   */
  on(type, handler) {
    if (!this._handlers.has(type)) {
      this._handlers.set(type, []);
    }
    this._handlers.get(type).push(handler);
  }

  /**
   * Remove a handler for a specific message type.
   * @param {string} type
   * @param {Function} handler
   */
  off(type, handler) {
    const handlers = this._handlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) handlers.splice(index, 1);
    }
  }

  /**
   * Register a handler for connection state changes.
   * @param {Function} handler
   */
  onStateChange(handler) {
    this.peer.onStateChange(handler);
  }

  /**
   * Dispatch a message to registered handlers.
   * @private
   * @param {GameMessage} message
   */
  _dispatch(message) {
    const handlers = this._handlers.get(message.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(message.payload, message);
      }
    }
  }
}
