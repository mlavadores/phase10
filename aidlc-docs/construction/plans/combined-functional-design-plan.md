# Combined Functional Design Plan — All Units

## Plan Overview
Combined functional design covering all 3 units in a single pass. Defines detailed business logic, domain models, algorithms, and rules.

---

## Clarifying Questions

### Question 1
For WebRTC signaling (how players exchange connection info), which approach do you prefer?

A) Manual copy-paste — Host copies an offer string, sends it to friend via any messaging app. Friend pastes it, gets an answer string, sends it back. Simple but requires 2 copy-paste exchanges.

B) URL-based — Encode the offer/answer in a URL hash fragment (e.g., `yoursite.com/#offer=...`). Host shares a link, friend opens it and a second link is generated to share back.

C) Third-party signaling server — Use a free service like PeerJS's public server or a Firebase Realtime Database for automatic signaling (adds external dependency but seamless UX)

D) Other (please describe after [Answer]: tag below)

[Answer]: C) Third-party signaling server — Use a free service like PeerJS's public server or a Firebase Realtime Database for automatic signaling (adds external dependency but seamless UX)

### Question 2
For the AI "thinking" delay, what timing feels right?

A) Short (500ms-1000ms per action) — fast-paced, minimal wait

B) Medium (1000ms-2000ms per action) — feels like a person thinking briefly

C) Variable (500ms-3000ms, randomized) — more human-like unpredictability

D) Other (please describe after [Answer]: tag below)

[Answer]: C) Variable (500ms-3000ms, randomized) — more human-like unpredictability

### Question 3
When a player selects cards to lay down a phase, how should the UI interaction work?

A) Click/tap cards to select them, then press a "Lay Down Phase" button — system auto-validates the grouping

B) Drag cards into designated "phase group" drop zones on the board, then confirm — allows player to manually specify which cards form which group (useful for Phase 9 and 10 which have two groups)

C) Click cards to select, then a multi-step dialog asks "Which group does this belong to?" for phases with multiple groups

D) Other (please describe after [Answer]: tag below)

[Answer]: B) Drag cards into designated "phase group" drop zones on the board, then confirm — allows player to manually specify which cards form which group (useful for Phase 9 and 10 which have two groups)

---

## Design Generation Steps

- [x] Step 1: Design domain entities and data models (Card, Deck, Player, GameState, PhaseDefinition)
- [x] Step 2: Design game rules engine (turn flow, validation rules, round/game lifecycle)
- [x] Step 3: Design phase validation algorithms (sets, runs, color groups, Wild card handling)
- [x] Step 4: Design scoring system
- [x] Step 5: Design AI strategies (easy and hard decision logic)
- [x] Step 6: Design WebRTC protocol (message types, state sync, host authority)
- [x] Step 7: Design UI component details (Web Component structure, state flow, interaction handlers)
- [x] Step 8: Design controller orchestration (turn coordination, undo mechanism, session lifecycle)

---

## Mandatory Artifacts
- [x] `aidlc-docs/construction/combined/functional-design/domain-entities.md`
- [x] `aidlc-docs/construction/combined/functional-design/business-logic-model.md`
- [x] `aidlc-docs/construction/combined/functional-design/business-rules.md`
- [x] `aidlc-docs/construction/combined/functional-design/frontend-components.md`
