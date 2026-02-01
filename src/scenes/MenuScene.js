import Phaser from 'phaser';
import { C64_PALETTE } from '../constants/palette.js';
import { GAME } from '../constants/game.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor(C64_PALETTE.BLUE);

    // Title text with shadow effect
    this.add.text(GAME.WIDTH / 2 + 2, 32, 'MR. ANGRY', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#000000'
    }).setOrigin(0.5);

    this.add.text(GAME.WIDTH / 2, 30, 'MR. ANGRY', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#B8C76F' // C64 Yellow
    }).setOrigin(0.5);

    // Year
    this.add.text(GAME.WIDTH / 2, 50, '2026', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#9AD284' // C64 Light Green
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME.WIDTH / 2, 68, 'A Spiritual Successor', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#70A4B2' // C64 Cyan
    }).setOrigin(0.5);

    // Display animated sprites as preview
    this.createSpritePreview();

    // Credits
    this.add.text(GAME.WIDTH / 2, 160, 'ORIGINAL BY STEVE WIGGINS 1985', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: '#6C6C6C' // Medium gray
    }).setOrigin(0.5);

    // Start prompt (will flash)
    this.startText = this.add.text(GAME.WIDTH / 2, 180, 'PRESS SPACE TO START', {
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
    this.input.keyboard.on('keydown-SPACE', this.startGame, this);

    // Also allow click/tap to start
    this.input.once('pointerdown', this.startGame, this);
  }

  createSpritePreview() {
    const centerX = GAME.WIDTH / 2;
    const y = 115;

    // Player sprite (animated)
    const player = this.add.sprite(centerX - 60, y, 'player', 0);
    player.play('player_walk');

    // Enemy sprites (animated)
    const inspector = this.add.sprite(centerX - 20, y, 'enemies', 0);
    inspector.play('inspector_walk');

    const manager = this.add.sprite(centerX + 20, y, 'enemies', 4);
    manager.play('manager_walk');

    const mrAngry = this.add.sprite(centerX + 60, y, 'enemies', 12);
    mrAngry.play('mr_angry_walk');

    // Items below
    const itemY = y + 25;
    this.add.sprite(centerX - 36, itemY, 'items', 0); // Pass
    this.add.sprite(centerX - 12, itemY, 'items', 1); // Key
    this.add.sprite(centerX + 12, itemY, 'items', 2); // Camera
    this.add.sprite(centerX + 36, itemY, 'items', 3); // Bulb
  }

  startGame() {
    // Remove listeners to prevent double-firing
    this.input.keyboard.off('keydown-SPACE', this.startGame, this);
    this.scene.start('GameScene');
  }
}
