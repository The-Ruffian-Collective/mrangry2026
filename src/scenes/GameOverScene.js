import Phaser from 'phaser';
import { C64_PALETTE } from '../constants/palette.js';
import { GAME } from '../constants/game.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    this.cameras.main.setBackgroundColor(C64_PALETTE.BLUE);

    // Game Over text
    this.add.text(GAME.WIDTH / 2, 60, 'GAME OVER', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#68372B' // C64 Red
    }).setOrigin(0.5);

    // Score display
    this.add.text(GAME.WIDTH / 2, 100, `SCORE: ${this.finalScore}`, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Retry prompt
    this.retryText = this.add.text(GAME.WIDTH / 2, 150, 'PRESS SPACE TO RETRY', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Flash the retry text
    this.tweens.add({
      targets: this.retryText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Listen for space key to restart
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MenuScene');
    });
  }
}
