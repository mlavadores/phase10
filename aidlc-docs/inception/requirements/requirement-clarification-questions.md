# Requirements Clarification Questions

I detected contradictions and a missing answer in your responses that need clarification:

---

## Contradiction 1: Online Multiplayer vs. No Backend/Static Hosting
You indicated "Online multiplayer only (real-time, players on different devices)" (Q2: B) and "Node.js with Express and WebSockets (Socket.io)" (Q6: A), but also "Browser-only storage" (Q4: A) and "Static hosting only (GitHub Pages, Netlify, Vercel — no backend)" (Q12: A).

Real-time online multiplayer with Socket.io requires a server process running persistently — this contradicts static-only hosting with no backend.

### Clarification Question 1
How should online multiplayer be implemented given the no-server constraint?

A) Use WebRTC peer-to-peer connections (no dedicated game server needed — one player hosts, others connect directly via browser; requires only a lightweight signaling mechanism)

B) Change deployment to full-stack (include a Node.js/Socket.io server — overrides Q12 answer to "Full-stack deployment")

C) Use a third-party real-time service (e.g., PeerJS for WebRTC signaling, or a hosted WebSocket service) with static frontend deployment

D) Drop online multiplayer — make it local-only with AI opponents on the same device

E) Other (please describe after [Answer]: tag below)

[Answer]: A) Use WebRTC peer-to-peer connections (no dedicated game server needed — one player hosts, others connect directly via browser; requires only a lightweight signaling mechanism)

---

## Missing Answer: Question 10
Your response to Question 10 (user accounts and authentication) was left empty.

### Clarification Question 2
Should the application include user accounts and authentication?

A) No accounts — players enter display names per session

B) Optional accounts — guest play available, accounts for stats/progression tracking

C) Required accounts — user registration needed to play

D) Other (please describe after [Answer]: tag below)

[Answer]: A) No accounts — players enter display names per session
