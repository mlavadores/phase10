/**
 * Phase 10 — Peer Connection Module
 * 
 * Wraps PeerJS for WebRTC peer-to-peer connectivity.
 * Handles connection establishment, lifecycle, and reconnection.
 * PeerJS is loaded via CDN in index.html.
 */

/**
 * @typedef {'connecting' | 'connected' | 'disconnected' | 'error'} ConnectionState
 */

/**
 * PeerConnection class wraps PeerJS for game connectivity.
 */
export class PeerConnection {
  constructor() {
    /** @type {any} PeerJS Peer instance */
    this.peer = null;
    /** @type {any} PeerJS DataConnection */
    this.connection = null;
    /** @type {ConnectionState} */
    this.state = 'disconnected';
    /** @type {string | null} */
    this.peerId = null;
    /** @type {boolean} */
    this.isHost = false;
    /** @type {Function[]} */
    this._stateListeners = [];
    /** @type {Function[]} */
    this._messageListeners = [];
    /** @type {number | null} */
    this._reconnectTimer = null;
  }

  /**
   * Create a host peer and wait for incoming connections.
   * @returns {Promise<string>} The room code (peer ID) to share
   */
  async createHost() {
    this.isHost = true;
    await this._initPeer();

    return new Promise((resolve, reject) => {
      this.peer.on('open', (id) => {
        this.peerId = id;
        this._setState('connecting');
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        this.connection = conn;
        this._setupConnection();
      });

      this.peer.on('error', (err) => {
        this._setState('error');
        reject(err);
      });
    });
  }

  /**
   * Join a host's game using their room code.
   * @param {string} hostId - The host's peer ID (room code)
   * @returns {Promise<void>}
   */
  async joinGame(hostId) {
    this.isHost = false;
    await this._initPeer();

    return new Promise((resolve, reject) => {
      this.peer.on('open', () => {
        this.connection = this.peer.connect(hostId, { reliable: true });
        this._setupConnection();

        this.connection.on('open', () => {
          resolve();
        });

        this.connection.on('error', (err) => {
          this._setState('error');
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        this._setState('error');
        reject(err);
      });
    });
  }

  /**
   * Send a message to the connected peer.
   * @param {Object} message
   */
  send(message) {
    if (this.connection && this.connection.open) {
      this.connection.send(JSON.stringify(message));
    }
  }

  /**
   * Register a message handler.
   * @param {Function} handler
   */
  onMessage(handler) {
    this._messageListeners.push(handler);
  }

  /**
   * Register a connection state change handler.
   * @param {Function} handler
   */
  onStateChange(handler) {
    this._stateListeners.push(handler);
  }

  /**
   * Get current connection state.
   * @returns {ConnectionState}
   */
  getConnectionState() {
    return this.state;
  }

  /**
   * Close the connection and clean up.
   */
  close() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this._setState('disconnected');
    this._messageListeners = [];
    this._stateListeners = [];
  }

  /**
   * Initialize PeerJS peer instance.
   * @private
   */
  async _initPeer() {
    // PeerJS loaded via CDN — access global Peer constructor
    if (typeof window.Peer === 'undefined') {
      // Dynamically load PeerJS if not already loaded
      await this._loadPeerJS();
    }
    this.peer = new window.Peer();
  }

  /**
   * Load PeerJS from CDN dynamically.
   * @private
   * @returns {Promise<void>}
   */
  _loadPeerJS() {
    return new Promise((resolve, reject) => {
      if (typeof window.Peer !== 'undefined') {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load PeerJS'));
      document.head.appendChild(script);
    });
  }

  /**
   * Set up connection event handlers.
   * @private
   */
  _setupConnection() {
    if (!this.connection) return;

    this.connection.on('open', () => {
      this._setState('connected');
    });

    this.connection.on('data', (data) => {
      try {
        const message = typeof data === 'string' ? JSON.parse(data) : data;
        for (const handler of this._messageListeners) {
          handler(message);
        }
      } catch (e) {
        console.warn('Failed to parse message:', e);
      }
    });

    this.connection.on('close', () => {
      this._setState('disconnected');
      this._attemptReconnect();
    });

    this.connection.on('error', (err) => {
      console.warn('Connection error:', err);
      this._setState('error');
    });
  }

  /**
   * Attempt reconnection within timeout (30 seconds).
   * @private
   */
  _attemptReconnect() {
    if (this._reconnectTimer) return;

    // Wait 30 seconds for reconnection before giving up
    this._reconnectTimer = setTimeout(() => {
      if (this.state === 'disconnected') {
        // Timeout — connection lost permanently
        this._reconnectTimer = null;
      }
    }, 30000);
  }

  /**
   * Update connection state and notify listeners.
   * @private
   * @param {ConnectionState} newState
   */
  _setState(newState) {
    this.state = newState;
    for (const handler of this._stateListeners) {
      handler(newState);
    }
  }
}
