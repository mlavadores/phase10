/**
 * Phase 10 — Application Entry Point
 * 
 * Registers all Web Components and initializes the Game Controller.
 */

// Import UI components (registers custom elements)
import './ui/game-board.js';

// Import Controller
import { GameController } from './controller/game-controller.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const board = document.querySelector('game-board');
  if (!board) {
    console.error('game-board element not found');
    return;
  }

  const controller = new GameController(board);
  controller.init();

  console.log('Phase 10 initialized');
});
