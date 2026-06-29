# Requirements Verification Questions

Please answer the following questions to help clarify the requirements for the Phase 10 web application. Fill in the letter choice after each [Answer]: tag.

---

## Question 1
What is the target number of simultaneous players per game session?

A) 2 players only

B) 2-4 players

C) 2-6 players (official Phase 10 rules support up to 6)

D) Other (please describe after [Answer]: tag below)

[Answer]: A) 2 players only

## Question 2
What types of multiplayer support are required?

A) Local multiplayer only (all players on the same device, taking turns)

B) Online multiplayer only (real-time, players on different devices)

C) Both local and online multiplayer

D) Other (please describe after [Answer]: tag below)

[Answer]: B) Online multiplayer only (real-time, players on different devices)

## Question 3
What AI opponent difficulty levels should be available?

A) Single difficulty level (medium/balanced)

B) Two levels (easy and hard)

C) Three levels (easy, medium, hard) with distinct strategies

D) Other (please describe after [Answer]: tag below)

[Answer]: B) Two levels (easy and hard)

## Question 4
What persistence/storage approach should be used for game state?

A) Browser-only storage (localStorage/IndexedDB, no server required)

B) Server-side storage with database (requires a backend server)

C) Both — offline-capable with optional cloud sync

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Browser-only storage (localStorage/IndexedDB, no server required)

## Question 5
What technology stack do you prefer for the frontend?

A) Vanilla HTML/CSS/JavaScript (no framework, lightweight)

B) React with TypeScript

C) Vue.js with TypeScript

D) Svelte/SvelteKit with TypeScript

E) Other (please describe after [Answer]: tag below)

[Answer]: A) Vanilla HTML/CSS/JavaScript (no framework, lightweight)

## Question 6
If online multiplayer is needed, what backend technology do you prefer?

A) Node.js with Express and WebSockets (Socket.io)

B) Node.js with Fastify and WebSockets

C) Python with FastAPI and WebSockets

D) Serverless (AWS Lambda + API Gateway WebSocket)

E) Not applicable (local-only mode selected in Q2)

F) Other (please describe after [Answer]: tag below)

[Answer]: A) Node.js with Express and WebSockets (Socket.io)

## Question 7
What level of animations and visual polish is expected?

A) Minimal — functional transitions only (card moves, turns)

B) Moderate — smooth card animations, turn indicators, phase completion effects

C) High — full card dealing animations, particle effects, sound effects, celebration animations

D) Other (please describe after [Answer]: tag below)

[Answer]: B) Moderate — smooth card animations, turn indicators, phase completion effects

## Question 8
What accessibility level is required?

A) Basic — keyboard navigation, proper semantic HTML, ARIA labels

B) Standard — WCAG 2.1 AA compliance (color contrast, screen reader support, focus management)

C) Comprehensive — WCAG 2.1 AAA where feasible, plus reduced motion support, high contrast mode

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Basic — keyboard navigation, proper semantic HTML, ARIA labels

## Question 9
What does "undo protection" mean in your requirements?

A) Prevent accidental card plays with a confirmation dialog before major actions

B) Allow undoing the last action within the current turn (before ending turn)

C) No undo at all — all actions are final, but with clear confirmation prompts

D) Other (please describe after [Answer]: tag below)

[Answer]: B) Allow undoing the last action within the current turn (before ending turn)

## Question 10
Should the application include user accounts and authentication?

A) No accounts — players enter display names per session

B) Optional accounts — guest play available, accounts for stats/progression tracking

C) Required accounts — user registration needed to play

D) Other (please describe after [Answer]: tag below)

[Answer]: A) No accounts — players enter display names per session

## Question 11
What game variants should be supported beyond standard Phase 10?

A) Standard Phase 10 rules only (the 10 official phases)

B) Standard plus custom phase lists (players can create custom phase orders)

C) Standard, custom phases, and optional house rules (e.g., skip phase on perfect round)

D) Other (please describe after [Answer]: tag below)

[Answer]: B) Standard plus custom phase lists (players can create custom phase orders)

## Question 12
What is the deployment target for this application?

A) Static hosting only (GitHub Pages, Netlify, Vercel — no backend)

B) Full-stack deployment (frontend + backend server on cloud provider)

C) Containerized deployment (Docker, can be deployed anywhere)

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Static hosting only (GitHub Pages, Netlify, Vercel — no backend)

---

## Question 13: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

C) Other (please describe after [Answer]: tag below)

[Answer]: B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

## Question 14: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)

B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)

C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

D) Other (please describe after [Answer]: tag below)

[Answer]: C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

## Question 15: Resiliency Extensions
Should the resiliency baseline be applied to this project?

The resiliency extension applies directional, design-time best practices for building resilient systems (fault tolerance, high availability, observability, recoverability). It is a starting point, not a production certification.

A) Yes — apply the resiliency baseline as directional best practices (recommended for business-critical workloads)

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects)

C) Other (please describe after [Answer]: tag below)

[Answer]: B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects)