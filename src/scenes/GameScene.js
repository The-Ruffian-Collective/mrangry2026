import Phaser from 'phaser';
import { C64_PALETTE } from '../constants/palette.js';
import { GAME } from '../constants/game.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor(C64_PALETTE.BLUE);

    // Title
    this.add.text(GAME.WIDTH / 2, 20, 'GAME SCENE', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Show sprites for testing
    this.createTestSprites();

    // Instructions
    this.add.text(GAME.WIDTH / 2, 180, 'Press G for Game Over', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#959595'
    }).setOrigin(0.5);

    // Key handlers
    this.input.keyboard.once('keydown-G', () => {
      this.scene.start('GameOverScene', { score: 1234 });
    });

    this.input.keyboard.once('keydown-M', () => {
      this.scene.start('MenuScene');
    });
  }

  createTestSprites() {
    const centerX = GAME.WIDTH / 2;

    // Player with animation
    const player = this.add.sprite(50, 100, 'player', 0);
    player.play('player_walk');
    this.add.text(50, 120, 'Player', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Enemies
    const enemyY = 100;
    const enemies = [
      { x: 100, name: 'Inspector', anim: 'inspector_walk' },
      { x: 150, name: 'Manager', anim: 'manager_walk' },
      { x: 200, name: 'Patron', anim: 'patron_walk' },
      { x: 250, name: 'Mr Angry', anim: 'mr_angry_walk' }
    ];

    enemies.forEach(e => {
      const sprite = this.add.sprite(e.x, enemyY, 'enemies');
      sprite.play(e.anim);
      this.add.text(e.x, enemyY + 20, e.name, {
        fontSize: '5px',
        fontFamily: 'monospace',
        color: '#FFFFFF'
      }).setOrigin(0.5);
    });

    // Items
    const itemY = 150;
    const items = ['Pass', 'Key', 'Camera', 'Bulb'];
    items.forEach((name, i) => {
      this.add.sprite(80 + i * 50, itemY, 'items', i);
      this.add.text(80 + i * 50, itemY + 15, name, {
        fontSize: '5px',
        fontFamily: 'monospace',
        color: '#FFFFFF'
      }).setOrigin(0.5);
    });

    // Door animation test
    const door = this.add.sprite(290, 80, 'doors', 0);
    this.add.text(290, 110, 'Door', {
      fontSize: '5px',
      fontFamily: 'monospace',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Animate door opening/closing
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (door.frame.name === 0) {
          door.play('door_open');
        } else {
          door.play('door_close');
        }
      },
      loop: true
    });

    // Polly
    const polly = this.add.sprite(290, 150, 'polly', 0);
    polly.play('polly_pose');
    this.add.text(290, 170, 'Polly', {
      fontSize: '5px',
      fontFamily: 'monospace',
      color: '#FFFFFF'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // Game logic will go here
  }
}
