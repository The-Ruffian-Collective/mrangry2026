import Phaser from 'phaser';
import { C64_PALETTE } from '../constants/palette.js';
import { GAME } from '../constants/game.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor(C64_PALETTE.BLUE);

    // Title text
    this.add.text(GAME.WIDTH / 2, 60, 'MR. ANGRY', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#B8C76F' // C64 Yellow
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME.WIDTH / 2, 85, 'A Spiritual Successor', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#70A4B2' // C64 Cyan
    }).setOrigin(0.5);

    // Start prompt (will flash)
    this.startText = this.add.text(GAME.WIDTH / 2, 150, 'PRESS SPACE TO START', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Flash the start text
    this.tweens.add({
      targets: this.startText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Listen for space key
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
  }
}
