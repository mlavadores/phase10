/**
 * Phase 10 — Deck Module
 * 
 * Manages the 108-card deck: creation, shuffling, drawing, discarding,
 * and reshuffling when the draw pile is exhausted.
 */

/** @typedef {import('../types.js').Card} Card */
/** @typedef {import('../types.js').GameState} GameState */

const COLORS = /** @type {const} */ (['red', 'blue', 'green', 'yellow']);

/**
 * Create the standard 108-card Phase 10 deck.
 * - Numbers 1-12: 2 of each per color (4 colors × 12 numbers × 2 = 96)
 * - Wild cards: 8
 * - Skip cards: 4
 * @returns {Card[]}
 */
export function createDeck() {
  /** @type {Card[]} */
  const cards = [];
  let idCounter = 0;

  // Number cards: 2 of each number (1-12) in each color
  for (const color of COLORS) {
    for (let number = 1; number <= 12; number++) {
      for (let copy = 0; copy < 2; copy++) {
        cards.push({
          id: `${color[0]}${number}-${copy}`,
          type: 'number',
          number,
          color
        });
        idCounter++;
      }
    }
  }

  // Wild cards: 8
  for (let i = 0; i < 8; i++) {
    cards.push({
      id: `wild-${i}`,
      type: 'wild',
      number: null,
      color: null
    });
  }

  // Skip cards: 4
  for (let i = 0; i < 4; i++) {
    cards.push({
      id: `skip-${i}`,
      type: 'skip',
      number: null,
      color: null
    });
  }

  return cards;
}

/**
 * Fisher-Yates shuffle (in-place, returns new array).
 * @param {Card[]} cards
 * @returns {Card[]} New shuffled array
 */
export function shuffle(cards) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Draw the top card from the draw pile.
 * If the draw pile is empty, reshuffles the discard pile first.
 * @param {GameState} state - Current game state
 * @returns {{card: Card, state: GameState}} Drawn card and updated state
 */
export function drawFromPile(state) {
  let newState = { ...state };

  // Reshuffle if draw pile is empty
  if (newState.drawPile.length === 0) {
    newState = reshuffleDiscard(newState);
  }

  const drawPile = [...newState.drawPile];
  const card = drawPile.pop();

  return {
    card,
    state: {
      ...newState,
      drawPile,
      drawnCard: card,
      drawnFrom: 'pile'
    }
  };
}

/**
 * Take the top card from the discard pile.
 * @param {GameState} state - Current game state
 * @returns {{card: Card, state: GameState}} Taken card and updated state
 */
export function drawFromDiscard(state) {
  const discardPile = [...state.discardPile];
  const card = discardPile.pop();

  return {
    card,
    state: {
      ...state,
      discardPile,
      drawnCard: card,
      drawnFrom: 'discard'
    }
  };
}

/**
 * Place a card on the discard pile.
 * @param {GameState} state - Current game state
 * @param {Card} card - Card to discard
 * @returns {GameState} Updated state
 */
export function discard(state, card) {
  const discardPile = [...state.discardPile, card];

  // Remove card from current player's hand
  const players = state.players.map((player, idx) => {
    if (idx !== state.currentPlayerIndex) return player;
    const hand = player.hand.filter(c => c.id !== card.id);
    return { ...player, hand };
  });

  return {
    ...state,
    players,
    discardPile,
    drawnCard: null,
    drawnFrom: null
  };
}

/**
 * Reshuffle the discard pile into a new draw pile.
 * Keeps the top card of the discard pile in place.
 * @param {GameState} state - Current game state
 * @returns {GameState} Updated state with reshuffled draw pile
 */
export function reshuffleDiscard(state) {
  const discardPile = [...state.discardPile];

  // Keep the top card on the discard pile
  const topCard = discardPile.pop();
  
  // Shuffle remaining discard into new draw pile
  const newDrawPile = shuffle(discardPile);

  return {
    ...state,
    drawPile: newDrawPile,
    discardPile: topCard ? [topCard] : []
  };
}

/**
 * Deal cards for a new round.
 * Creates a fresh shuffled deck, deals 10 cards per player,
 * places one card on discard (re-dealing if it's a Skip).
 * @param {number} playerCount - Number of players (always 2)
 * @returns {{hands: Card[][], drawPile: Card[], discardPile: Card[]}}
 */
export function dealRound(playerCount) {
  let deck = shuffle(createDeck());

  // Deal 10 cards to each player
  const hands = [];
  for (let p = 0; p < playerCount; p++) {
    hands.push(deck.splice(0, 10));
  }

  // Place first card on discard pile (cannot be a Skip card)
  let firstDiscard = deck.pop();
  while (firstDiscard && firstDiscard.type === 'skip') {
    // Put skip back somewhere in the deck and draw again
    deck.unshift(firstDiscard);
    deck = shuffle(deck);
    firstDiscard = deck.pop();
  }

  return {
    hands,
    drawPile: deck,
    discardPile: firstDiscard ? [firstDiscard] : []
  };
}
