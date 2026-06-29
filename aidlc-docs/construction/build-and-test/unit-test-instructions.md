# Unit Test Instructions — Phase 10 Web Application

## Testing Strategy

This is a vanilla JavaScript application with no framework. Unit tests can be run using any of these approaches:

### Recommended: Browser-based test runner
Since the application uses native ES modules and browser APIs (localStorage, CustomElements), tests should run in a browser environment.

---

## Option A: Manual Console Testing

Open the application in a browser and run tests directly in the DevTools console:

### Game Engine Tests

```javascript
// Import modules
const { createDeck, shuffle, drawFromPile, drawFromDiscard } = await import('./src/game-engine/deck.js');
const { validatePhase, validateSet, validateRun, validateHit } = await import('./src/game-engine/phase-validator.js');
const { scoreHand } = await import('./src/game-engine/scoring.js');
const { createInitialState } = await import('./src/game-engine/game-state.js');

// Test 1: Deck creation (108 cards)
const deck = createDeck();
console.assert(deck.length === 108, `Deck should have 108 cards, got ${deck.length}`);
console.assert(deck.filter(c => c.type === 'number').length === 96, 'Should have 96 number cards');
console.assert(deck.filter(c => c.type === 'wild').length === 8, 'Should have 8 wild cards');
console.assert(deck.filter(c => c.type === 'skip').length === 4, 'Should have 4 skip cards');
console.log('✓ Deck creation OK');

// Test 2: Shuffle produces different order
const shuffled = shuffle(deck);
console.assert(shuffled.length === 108, 'Shuffled deck should have 108 cards');
console.assert(shuffled[0].id !== deck[0].id || shuffled[1].id !== deck[1].id, 'Shuffle should change order');
console.log('✓ Shuffle OK');

// Test 3: Phase 1 validation (2 sets of 3)
const validPhase1 = [
  [{id:'r1-0',type:'number',number:5,color:'red'},{id:'b1-0',type:'number',number:5,color:'blue'},{id:'g1-0',type:'number',number:5,color:'green'}],
  [{id:'r2-0',type:'number',number:9,color:'red'},{id:'b2-0',type:'number',number:9,color:'blue'},{id:'wild-0',type:'wild',number:null,color:null}]
];
const result = validatePhase(validPhase1, 1);
console.assert(result.valid === true, 'Valid Phase 1 should pass');
console.log('✓ Phase 1 validation OK');

// Test 4: Invalid phase (wrong numbers in set)
const invalidPhase = [
  [{id:'r1-0',type:'number',number:5,color:'red'},{id:'b1-0',type:'number',number:6,color:'blue'},{id:'g1-0',type:'number',number:5,color:'green'}],
  [{id:'r2-0',type:'number',number:9,color:'red'},{id:'b2-0',type:'number',number:9,color:'blue'},{id:'g2-0',type:'number',number:9,color:'green'}]
];
const invalidResult = validatePhase(invalidPhase, 1);
console.assert(invalidResult.valid === false, 'Invalid Phase 1 should fail');
console.log('✓ Invalid phase rejection OK');

// Test 5: Run validation (Phase 4: run of 7)
const validRun = [[
  {id:'a',type:'number',number:3,color:'red'},
  {id:'b',type:'number',number:4,color:'blue'},
  {id:'c',type:'number',number:5,color:'green'},
  {id:'d',type:'number',number:6,color:'red'},
  {id:'e',type:'number',number:7,color:'yellow'},
  {id:'f',type:'number',number:8,color:'blue'},
  {id:'g',type:'number',number:9,color:'green'}
]];
const runResult = validatePhase(validRun, 4);
console.assert(runResult.valid === true, 'Valid run of 7 should pass');
console.log('✓ Run validation OK');

// Test 6: Scoring
const hand = [
  {id:'a',type:'number',number:3,color:'red'},   // 5 pts
  {id:'b',type:'number',number:11,color:'blue'},  // 10 pts
  {id:'c',type:'wild',number:null,color:null},     // 25 pts
  {id:'d',type:'skip',number:null,color:null}      // 15 pts
];
const score = scoreHand(hand);
console.assert(score === 55, `Score should be 55, got ${score}`);
console.log('✓ Scoring OK');

// Test 7: Game state creation
const config = {mode:'ai',difficulty:'easy',playerNames:['Alice','AI'],phaseList:[1,2,3,4,5,6,7,8,9,10],customPhaseListId:null};
const state = createInitialState(config);
console.assert(state.players.length === 2, 'Should have 2 players');
console.assert(state.players[0].hand.length === 10, 'Player should have 10 cards');
console.assert(state.players[1].hand.length === 10, 'AI should have 10 cards');
console.assert(state.drawPile.length + state.discardPile.length === 108 - 20, 'Remaining cards in piles');
console.log('✓ Game state creation OK');

console.log('\\n=== All unit tests passed! ===');
```

---

## Option B: Automated Testing with Vitest (Add if Needed)

If a test runner is desired, add Vitest (works with native ES modules):

### Setup
```bash
npm install --save-dev vitest jsdom
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest --run",
    "test:watch": "vitest"
  }
}
```

### Example Test File (`tests/game-engine.test.js`)
```javascript
import { describe, it, expect } from 'vitest';
import { createDeck, shuffle } from '../src/game-engine/deck.js';
import { validatePhase } from '../src/game-engine/phase-validator.js';
import { scoreHand } from '../src/game-engine/scoring.js';

describe('Deck', () => {
  it('creates 108 cards', () => {
    expect(createDeck()).toHaveLength(108);
  });
  it('shuffles without losing cards', () => {
    expect(shuffle(createDeck())).toHaveLength(108);
  });
});

describe('Phase Validator', () => {
  it('validates Phase 1 (2 sets of 3)', () => {
    const groups = [
      [{id:'a',type:'number',number:5,color:'red'},{id:'b',type:'number',number:5,color:'blue'},{id:'c',type:'number',number:5,color:'green'}],
      [{id:'d',type:'number',number:9,color:'red'},{id:'e',type:'number',number:9,color:'blue'},{id:'f',type:'number',number:9,color:'green'}]
    ];
    expect(validatePhase(groups, 1).valid).toBe(true);
  });
});

describe('Scoring', () => {
  it('scores correctly', () => {
    const hand = [
      {id:'a',type:'number',number:3,color:'red'},
      {id:'b',type:'number',number:11,color:'blue'},
      {id:'c',type:'wild',number:null,color:null},
      {id:'d',type:'skip',number:null,color:null}
    ];
    expect(scoreHand(hand)).toBe(55);
  });
});
```

---

## Expected Test Coverage

| Module | Key Functions Tested | Critical Paths |
|--------|---------------------|----------------|
| deck.js | createDeck, shuffle, drawFromPile, dealRound | Card count, shuffle randomness, deal correctness |
| phase-validator.js | validatePhase (all 10 phases), validateHit | Wild substitution, run gaps, color matching |
| game-state.js | createInitialState, nextTurn, layDownPhase | State transitions, player hand updates |
| scoring.js | scoreHand, updateScores, getWinner | Point calculation, tie-breaking |
| rules.js | isValidDraw/Discard, canLayDownPhase, isGameOver | TR-4 enforcement, round/game end detection |
| storage/*.js | save/load/clear functions | localStorage read/write, JSON serialization |
