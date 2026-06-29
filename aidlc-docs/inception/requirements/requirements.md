# Phase 10 Web Application — Requirements Document

## Intent Analysis Summary

- **User Request**: Build a modern browser-based Phase 10 web application with multiplayer, AI opponents, game persistence, phase validation, scoring, animations, responsive design, accessibility, undo protection, rule enforcement, and intuitive UX.
- **Request Type**: New Project (Greenfield)
- **Scope Estimate**: System-wide (full application from scratch)
- **Complexity Estimate**: Complex (multiple subsystems: game engine, networking, AI, UI, persistence)

---

## Functional Requirements

### FR-1: Core Game Engine
- **FR-1.1**: Implement the complete Phase 10 card game rules faithfully per official Mattel rules.
- **FR-1.2**: Support a deck of 108 cards: numbers 1-12 in four colors (red, blue, green, yellow), 8 Wild cards, 4 Skip cards.
- **FR-1.3**: Deal 10 cards to each player at round start.
- **FR-1.4**: Enforce turn structure: Draw (from draw pile or discard pile) → Optional Phase lay-down → Optional hitting → Discard.
- **FR-1.5**: Validate all 10 official phases:
  - Phase 1: 2 sets of 3
  - Phase 2: 1 set of 3 + 1 run of 4
  - Phase 3: 1 set of 4 + 1 run of 4
  - Phase 4: 1 run of 7
  - Phase 5: 1 run of 8
  - Phase 6: 1 run of 9
  - Phase 7: 2 sets of 4
  - Phase 8: 7 cards of one color
  - Phase 9: 1 set of 5 + 1 set of 2
  - Phase 10: 1 set of 5 + 1 set of 3
- **FR-1.6**: Enforce Wild card rules — Wilds can substitute for any number or color in sets/runs.
- **FR-1.7**: Enforce Skip card rules — Skip cards force the targeted player to lose their next turn.
- **FR-1.8**: Implement "hitting" — after laying down a phase, a player may add cards to any completed phase group on the table (own or opponent's).
- **FR-1.9**: Round ends when any player discards their last card ("goes out").
- **FR-1.10**: Players who did not complete their phase must reattempt the same phase next round.
- **FR-1.11**: Game ends when any player completes Phase 10 and goes out (or the round ends with a player having completed Phase 10).
- **FR-1.12**: Handle tie-breaking — if both players complete Phase 10 in the same round, lowest score wins.

### FR-2: Scoring System
- **FR-2.1**: Score penalty points for cards remaining in hand at end of each round:
  - Cards 1-9: 5 points each
  - Cards 10-12: 10 points each
  - Skip cards: 15 points each
  - Wild cards: 25 points each
- **FR-2.2**: Track cumulative scores across rounds.
- **FR-2.3**: Display score summary after each round.
- **FR-2.4**: Display final game results with winner determination.

### FR-3: Player Support
- **FR-3.1**: Support exactly 2 players per game session.
- **FR-3.2**: Players enter display names per session (no accounts required).
- **FR-3.3**: Game modes: Human vs Human (online), Human vs AI.

### FR-4: Online Multiplayer (WebRTC Peer-to-Peer)
- **FR-4.1**: One player creates a game room and receives a shareable room code/link.
- **FR-4.2**: Second player joins using the room code/link.
- **FR-4.3**: Use WebRTC data channels for real-time game state synchronization.
- **FR-4.4**: Implement connection establishment with signaling (can use a simple copy-paste offer/answer mechanism or a lightweight signaling approach).
- **FR-4.5**: Handle disconnection gracefully — notify opponent, allow reconnection within timeout.
- **FR-4.6**: The hosting player's browser acts as the authoritative game state.
- **FR-4.7**: Prevent cheating by validating moves on the host side before broadcasting state.

### FR-5: AI Opponents
- **FR-5.1**: Two difficulty levels: Easy and Hard.
- **FR-5.2**: Easy AI: Makes basic decisions — prioritizes collecting cards for current phase, discards randomly from non-useful cards.
- **FR-5.3**: Hard AI: Uses strategic decision-making — evaluates card utility, considers opponent's probable phase, makes optimal discard choices, strategic use of Skip/Wild cards.
- **FR-5.4**: AI actions should have a brief delay to simulate "thinking" (not instant).
- **FR-5.5**: AI must follow all game rules identically to human players.

### FR-6: Game Persistence
- **FR-6.1**: Save game state to browser localStorage/IndexedDB.
- **FR-6.2**: Allow resuming an in-progress game after page reload (single-player/AI games only).
- **FR-6.3**: Store game history (past completed games with scores).
- **FR-6.4**: Provide option to clear saved data.

### FR-7: Phase Validation
- **FR-7.1**: Validate phase attempts in real-time as player selects cards.
- **FR-7.2**: Provide visual feedback indicating whether selected cards form a valid phase.
- **FR-7.3**: Prevent invalid phase lay-downs (enforce correct card combinations).
- **FR-7.4**: Support Wild card substitution in validation logic.

### FR-8: Undo Protection
- **FR-8.1**: Allow undoing the last action within the current turn (before ending the turn).
- **FR-8.2**: Actions eligible for undo: card draw choice, card discard, phase lay-down, hitting.
- **FR-8.3**: Undo resets game state to the state before that action.
- **FR-8.4**: Only one level of undo (cannot undo multiple actions in sequence beyond the last).
- **FR-8.5**: Undo is not available after turn ends or in opponent's turn.

### FR-9: Custom Phase Lists
- **FR-9.1**: Allow players to create custom phase orders before starting a game.
- **FR-9.2**: Custom phases use the same building blocks (sets, runs, color groups) but in user-defined order.
- **FR-9.3**: Provide a phase list editor UI.
- **FR-9.4**: Save custom phase lists to localStorage for reuse.
- **FR-9.5**: Default to official 10 phases if no custom list selected.

### FR-10: User Interface
- **FR-10.1**: Display current player's hand with interactive card selection.
- **FR-10.2**: Display draw pile and discard pile (top card visible on discard).
- **FR-10.3**: Display opponent's card count (back of cards only — no cheating).
- **FR-10.4**: Display phase progress tracker showing current phase for each player.
- **FR-10.5**: Display score tracker.
- **FR-10.6**: Display turn indicator clearly showing whose turn it is.
- **FR-10.7**: Provide game menu: New Game, Resume, Settings, Rules/Help.
- **FR-10.8**: Include a rules/tutorial section explaining Phase 10 for new players.
- **FR-10.9**: Display game log showing recent actions (draws, discards, phase completions).

---

## Non-Functional Requirements

### NFR-1: Technology Stack
- **NFR-1.1**: Frontend — Vanilla HTML5, CSS3, JavaScript (ES2020+). No framework dependencies.
- **NFR-1.2**: Networking — WebRTC with RTCDataChannel for peer-to-peer game communication.
- **NFR-1.3**: Storage — localStorage and/or IndexedDB for persistence.
- **NFR-1.4**: Deployment — Static hosting compatible (GitHub Pages, Netlify, Vercel).
- **NFR-1.5**: No server-side dependencies for core gameplay.

### NFR-2: Performance
- **NFR-2.1**: Page load under 3 seconds on 3G connection.
- **NFR-2.2**: Game interactions respond within 100ms.
- **NFR-2.3**: Animations run at 60fps on modern devices.
- **NFR-2.4**: Total bundle size under 500KB (uncompressed).

### NFR-3: Responsive Design
- **NFR-3.1**: Fully playable on mobile devices (320px width and up).
- **NFR-3.2**: Optimized layouts for tablet and desktop.
- **NFR-3.3**: Touch-friendly card interaction on mobile (drag, tap to select).
- **NFR-3.4**: Landscape and portrait orientation support.

### NFR-4: Accessibility
- **NFR-4.1**: Full keyboard navigation for all game actions.
- **NFR-4.2**: Proper semantic HTML structure.
- **NFR-4.3**: ARIA labels on interactive elements.
- **NFR-4.4**: Visible focus indicators.
- **NFR-4.5**: Cards identified by number and color (not color alone).

### NFR-5: Animations
- **NFR-5.1**: Smooth card movement animations (draw, discard, lay-down).
- **NFR-5.2**: Turn transition indicators.
- **NFR-5.3**: Phase completion celebration effect.
- **NFR-5.4**: Round end/score summary animation.
- **NFR-5.5**: CSS-based animations preferred (GPU-accelerated).
- **NFR-5.6**: Respect `prefers-reduced-motion` media query.

### NFR-6: Browser Compatibility
- **NFR-6.1**: Support latest 2 versions of Chrome, Firefox, Safari, Edge.
- **NFR-6.2**: WebRTC support required (excludes older browsers).
- **NFR-6.3**: Graceful degradation for unsupported features.

### NFR-7: Code Quality
- **NFR-7.1**: Modular JavaScript with clear separation of concerns (game engine, UI, networking, AI, storage).
- **NFR-7.2**: Well-documented code with JSDoc comments.
- **NFR-7.3**: Consistent code style.
- **NFR-7.4**: No global namespace pollution (use ES modules).

---

## Constraints

- **C-1**: No backend server — all game logic runs in the browser.
- **C-2**: No user authentication or account system.
- **C-3**: No third-party framework dependencies (vanilla JS only).
- **C-4**: Must be deployable as static files.
- **C-5**: 2-player limit per game session.
- **C-6**: WebRTC signaling requires players to exchange connection info manually (offer/answer copy-paste or room code via external channel) unless a lightweight free signaling service is used.

---

## Assumptions

- **A-1**: Players have modern browsers with WebRTC support.
- **A-2**: Players have a way to share room codes/links (messaging, email, etc.).
- **A-3**: Game state authority rests with the hosting player's browser.
- **A-4**: No real-money wagering or in-app purchases.
- **A-5**: Game rules follow the standard Mattel Phase 10 card game (2010+ edition).
