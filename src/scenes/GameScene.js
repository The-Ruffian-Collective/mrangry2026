import Phaser from 'phaser';
import { C64_PALETTE } from '../constants/palette.js';
import { GAME } from '../constants/game.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor(C64_PALETTE.BLUE);

    // Placeholder text
    this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2, 'GAME SCENE', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Temporary: Press G to go to game over
    this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2 + 30, 'Press G for Game Over', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#959595'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-G', () => {
      this.scene.start('GameOverScene', { score: 0 });
    });
  }

  update(time, delta) {
    // Game logic will go here
  }
}
