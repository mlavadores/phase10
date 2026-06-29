# Unit of Work — Story Map

## Story-to-Unit Assignment

### Unit 1: Core Foundation
| Story ID | Story Title | Priority | Rationale |
|----------|-------------|----------|-----------|
| US-1.1 | Play a Complete Round | Must | Core game loop logic |
| US-1.2 | Complete and Validate Phases | Must | Phase validation engine |
| US-1.3 | Hit on Existing Phases | Must | Hitting validation rules |
| US-1.4 | Use Wild and Skip Cards | Must | Special card rule logic |
| US-1.5 | End-of-Round Scoring | Must | Scoring calculation |
| US-1.6 | Win the Game | Must | Game-over conditions |
| US-4.1 | Save and Resume Games | Should | Storage persistence |
| US-4.3 | View Game History | Could | History storage |
| US-6.1 | Create Custom Phase Order | Could | Phase list storage |
| US-6.2 | Use Saved Phase Lists | Could | Phase list retrieval |

**Total**: 10 stories (6 Must, 1 Should, 3 Could)

---

### Unit 2: Features
| Story ID | Story Title | Priority | Rationale |
|----------|-------------|----------|-----------|
| US-2.1 | Host a Game | Must | WebRTC host setup |
| US-2.2 | Join a Game | Must | WebRTC join flow |
| US-2.3 | Handle Disconnections | Should | Network resilience |
| US-3.1 | Play Against Easy AI | Must | Easy AI strategy |
| US-3.2 | Play Against Hard AI | Must | Hard AI strategy |
| US-5.1 | Responsive Game Interface | Must | UI Web Components |
| US-5.2 | Animated Card Interactions | Should | CSS animations |
| US-5.3 | Learn the Game Rules | Must | Rules panel component |
| US-5.4 | Accessible Gameplay | Should | Keyboard nav, ARIA |
| US-6.1 | Create Custom Phase Order | Could | Phase editor UI component |

**Total**: 10 stories (5 Must, 3 Should, 2 Could)

*Note: US-6.1 appears in both Unit 1 (storage) and Unit 2 (UI editor) — it spans both units.*

---

### Unit 3: Integration
| Story ID | Story Title | Priority | Rationale |
|----------|-------------|----------|-----------|
| US-1.1 | Play a Complete Round | Must | Controller orchestrates full turn flow |
| US-4.2 | Undo Last Action | Should | Controller manages undo snapshots |
| US-2.1 | Host a Game | Must | Session manager creates P2P session |
| US-2.2 | Join a Game | Must | Session manager joins P2P session |
| US-3.1 | Play Against Easy AI | Must | Controller triggers AI turns |
| US-3.2 | Play Against Hard AI | Must | Controller triggers AI turns |

**Total**: 6 stories (5 Must, 1 Should)

*Note: Several stories appear in multiple units because they span layers (e.g., US-1.1 needs engine rules in Unit 1, UI in Unit 2, and controller coordination in Unit 3).*

---

## Coverage Summary

| Story ID | Title | Unit 1 | Unit 2 | Unit 3 |
|----------|-------|--------|--------|--------|
| US-1.1 | Play a Complete Round | ✓ | | ✓ |
| US-1.2 | Complete and Validate Phases | ✓ | | |
| US-1.3 | Hit on Existing Phases | ✓ | | |
| US-1.4 | Use Wild and Skip Cards | ✓ | | |
| US-1.5 | End-of-Round Scoring | ✓ | | |
| US-1.6 | Win the Game | ✓ | | |
| US-2.1 | Host a Game | | ✓ | ✓ |
| US-2.2 | Join a Game | | ✓ | ✓ |
| US-2.3 | Handle Disconnections | | ✓ | |
| US-3.1 | Play Against Easy AI | | ✓ | ✓ |
| US-3.2 | Play Against Hard AI | | ✓ | ✓ |
| US-4.1 | Save and Resume Games | ✓ | | |
| US-4.2 | Undo Last Action | | | ✓ |
| US-4.3 | View Game History | ✓ | | |
| US-5.1 | Responsive Game Interface | | ✓ | |
| US-5.2 | Animated Card Interactions | | ✓ | |
| US-5.3 | Learn the Game Rules | | ✓ | |
| US-5.4 | Accessible Gameplay | | ✓ | |
| US-6.1 | Create Custom Phase Order | ✓ | ✓ | |
| US-6.2 | Use Saved Phase Lists | ✓ | | |

**All 20 stories assigned** — no orphaned stories.
