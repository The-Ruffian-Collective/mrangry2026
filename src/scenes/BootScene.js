import Phaser from 'phaser';
import { C64_PALETTE } from '../constants/palette.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Future: Load assets here
    // For now, just set background color
    this.cameras.main.setBackgroundColor(C64_PALETTE.BLUE);
  }

  create() {
    // Transition to MenuScene after a brief delay
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}
