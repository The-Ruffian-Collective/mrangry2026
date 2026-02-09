import Phaser from 'phaser';
import { C64_PALETTE, C64_PALETTE_HEX } from '../constants/palette.js';
import { GAME } from '../constants/game.js';

/**
 * GameOverScene - Displays game results (win or lose)
 *
 * Shows final score, high score, and option to retry.
 * Differentiates between winning (photographed Polly) and losing.
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.isWin = data.isWin || false;
    this.timeRemaining = data.timeRemaining || 0;

    // Load and update high score from localStorage
    this.highScore = this.loadHighScore();
    if (this.finalScore > this.highScore) {
      this.highScore = this.finalScore;
      this.saveHighScore(this.finalScore);
      this.isNewHighScore = true;
    } else {
      this.isNewHighScore = false;
    }
  }

  create() {
    this.cameras.main.setBackgroundColor(C64_PALETTE.BLUE);

    // Title - different for win/lose
    const titleText = this.isWin ? 'SCOOP!' : 'GAME OVER';
    const titleColor = this.isWin ? C64_PALETTE_HEX.LIGHT_GREEN : C64_PALETTE_HEX.RED;

    this.add.text(GAME.WIDTH / 2, 30, titleText, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: titleColor
    }).setOrigin(0.5);

    // Subtitle for win
    if (this.isWin) {
      this.add.text(GAME.WIDTH / 2, 50, 'YOU GOT THE PHOTO!', {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: C64_PALETTE_HEX.YELLOW
      }).setOrigin(0.5);
    }

    // Score breakdown
    let yPos = 75;

    // Final score
    this.add.text(GAME.WIDTH / 2, yPos, 'FINAL SCORE', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: C64_PALETTE_HEX.LIGHT_GRAY
    }).setOrigin(0.5);

    yPos += 15;

    const scoreText = this.add.text(GAME.WIDTH / 2, yPos, this.finalScore.toString().padStart(6, '0'), {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: C64_PALETTE_HEX.WHITE
    }).setOrigin(0.5);

    // Animate score if win
    if (this.isWin) {
      this.tweens.add({
        targets: scoreText,
        scale: 1.2,
        duration: 300,
        yoyo: true,
        repeat: 2
      });
    }

    yPos += 25;

    // High score
    this.add.text(GAME.WIDTH / 2, yPos, 'HIGH SCORE', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: C64_PALETTE_HEX.LIGHT_GRAY
    }).setOrigin(0.5);

    yPos += 12;

    const highScoreColor = this.isNewHighScore ? C64_PALETTE_HEX.YELLOW : C64_PALETTE_HEX.LIGHT_BLUE;
    const highScoreText = this.add.text(GAME.WIDTH / 2, yPos, this.highScore.toString().padStart(6, '0'), {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: highScoreColor
    }).setOrigin(0.5);

    // New high score indicator
    if (this.isNewHighScore) {
      yPos += 15;
      const newHSText = this.add.text(GAME.WIDTH / 2, yPos, '*** NEW HIGH SCORE! ***', {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: C64_PALETTE_HEX.YELLOW
      }).setOrigin(0.5);

      // Flash effect
      this.tweens.add({
        targets: newHSText,
        alpha: 0.3,
        duration: 300,
        yoyo: true,
        repeat: -1
      });
    }

    // Time bonus info (if won)
    if (this.isWin && this.timeRemaining > 0) {
      yPos += 20;
      const timeBonus = Math.floor(this.timeRemaining) * GAME.SCORE_TIME_BONUS;
      this.add.text(GAME.WIDTH / 2, yPos, `TIME BONUS: +${timeBonus}`, {
        fontSize: '7px',
        fontFamily: 'monospace',
        color: C64_PALETTE_HEX.CYAN
      }).setOrigin(0.5);
    }

    // Retry prompt
    yPos = 165;
    this.retryText = this.add.text(GAME.WIDTH / 2, yPos, 'PRESS SPACE TO PLAY AGAIN', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: C64_PALETTE_HEX.WHITE
    }).setOrigin(0.5);

    // Flash the retry text
    this.tweens.add({
      targets: this.retryText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Menu hint
    this.add.text(GAME.WIDTH / 2, yPos + 15, 'ESC: Return to Menu', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: C64_PALETTE_HEX.DARK_GRAY
    }).setOrigin(0.5);

    // Listen for space key to restart
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

    // Listen for escape key to return to menu
    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  /**
   * Load high score from localStorage
   */
  loadHighScore() {
    try {
      const stored = localStorage.getItem('mrAngry2026_highScore');
      return stored ? parseInt(stored, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Save high score to localStorage
   */
  saveHighScore(score) {
    try {
      localStorage.setItem('mrAngry2026_highScore', score.toString());
    } catch (e) {
      console.warn('Could not save high score:', e);
    }
  }
}
