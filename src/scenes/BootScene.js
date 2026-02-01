import Phaser from 'phaser';
import { C64_PALETTE } from '../constants/palette.js';
import { GAME } from '../constants/game.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.cameras.main.setBackgroundColor(C64_PALETTE.BLUE);

    // Create loading bar
    this.createLoadingBar();

    // Load sprite sheets
    this.load.spritesheet('player', 'assets/sprites/player.png', {
      frameWidth: 24,
      frameHeight: 21
    });

    this.load.spritesheet('enemies', 'assets/sprites/enemies.png', {
      frameWidth: 24,
      frameHeight: 21
    });

    this.load.spritesheet('items', 'assets/sprites/items.png', {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.spritesheet('doors', 'assets/sprites/doors.png', {
      frameWidth: 16,
      frameHeight: 32
    });

    this.load.spritesheet('polly', 'assets/sprites/polly.png', {
      frameWidth: 24,
      frameHeight: 21
    });

    // Load tileset and tilemap
    this.load.image('tileset', 'assets/sprites/tileset.png');
    this.load.tilemapTiledJSON('level1', 'assets/tilemaps/level1.json');
  }

  createLoadingBar() {
    const width = GAME.WIDTH;
    const height = GAME.HEIGHT;

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 20, 'LOADING...', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#B8C76F'
    }).setOrigin(0.5);

    // Progress bar background
    const barBg = this.add.rectangle(width / 2, height / 2 + 10, 200, 16, 0x444444);

    // Progress bar fill
    const barFill = this.add.rectangle(width / 2 - 98, height / 2 + 10, 0, 12, 0x70A4B2);
    barFill.setOrigin(0, 0.5);

    // Update progress bar
    this.load.on('progress', (value) => {
      barFill.width = 196 * value;
    });

    // Clean up when complete
    this.load.on('complete', () => {
      loadingText.destroy();
      barBg.destroy();
      barFill.destroy();
    });
  }

  create() {
    // Define all animations
    this.createAnimations();

    // Transition to MenuScene
    this.time.delayedCall(300, () => {
      this.scene.start('MenuScene');
    });
  }

  createAnimations() {
    // Player walk animation
    this.anims.create({
      key: 'player_walk',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    // Player idle
    this.anims.create({
      key: 'player_idle',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 1
    });

    // Player climb
    this.anims.create({
      key: 'player_climb',
      frames: this.anims.generateFrameNumbers('player', { start: 4, end: 5 }),
      frameRate: 4,
      repeat: -1
    });

    // Player death
    this.anims.create({
      key: 'player_death',
      frames: this.anims.generateFrameNumbers('player', { start: 6, end: 7 }),
      frameRate: 8,
      repeat: 2
    });

    // Enemy walk animations (4 enemies, 4 frames each)
    const enemyTypes = ['inspector', 'manager', 'patron', 'mr_angry'];
    enemyTypes.forEach((type, index) => {
      this.anims.create({
        key: `${type}_walk`,
        frames: this.anims.generateFrameNumbers('enemies', {
          start: index * 4,
          end: index * 4 + 3
        }),
        frameRate: 6,
        repeat: -1
      });

      this.anims.create({
        key: `${type}_idle`,
        frames: [{ key: 'enemies', frame: index * 4 }],
        frameRate: 1
      });
    });

    // Door animations
    this.anims.create({
      key: 'door_open',
      frames: this.anims.generateFrameNumbers('doors', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0
    });

    this.anims.create({
      key: 'door_close',
      frames: this.anims.generateFrameNumbers('doors', { start: 3, end: 0 }),
      frameRate: 8,
      repeat: 0
    });

    // Polly animation
    this.anims.create({
      key: 'polly_pose',
      frames: this.anims.generateFrameNumbers('polly', { start: 0, end: 1 }),
      frameRate: 0.2, // Very slow - crosses legs every 5 seconds
      repeat: -1
    });
  }
}
