import Phaser from 'phaser';
import { C64_PALETTE } from '../constants/palette.js';
import { GAME } from '../constants/game.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor(C64_PALETTE.BLUE);

    // Create tilemap
    this.createLevel();

    // Parse object layer for spawn points
    this.parseObjects();

    // Create test sprite to verify collision
    this.createTestPlayer();

    // Instructions
    this.add.text(GAME.WIDTH / 2, 8, 'Phase 3: Tilemap Test - Arrow keys to move', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: '#B8C76F'
    }).setOrigin(0.5);

    this.add.text(GAME.WIDTH / 2, 192, 'Press G=GameOver, M=Menu', {
      fontSize: '6px',
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

    // Setup cursor keys
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  createLevel() {
    // Create the tilemap
    this.map = this.make.tilemap({ key: 'level1' });

    // Add tileset to map
    const tileset = this.map.addTilesetImage('tileset', 'tileset');

    // Create background layer (decorative, no collision)
    this.backgroundLayer = this.map.createLayer('background', tileset, 0, 0);
    if (this.backgroundLayer) {
      this.backgroundLayer.setDepth(GAME.LAYER_BACKGROUND);
    }

    // Create collision layer
    this.collisionLayer = this.map.createLayer('collision', tileset, 0, 0);
    if (this.collisionLayer) {
      this.collisionLayer.setDepth(GAME.LAYER_TILES);

      // Set collision on floor tiles (tile index 1 in data = gid 1 in tileset)
      // Tiles with index 1 are floor tiles that should block movement from below
      this.collisionLayer.setCollisionByExclusion([-1, 0]);
    }

    console.log('Tilemap loaded:', this.map.width, 'x', this.map.height, 'tiles');
  }

  parseObjects() {
    // Get objects layer
    const objectLayer = this.map.getObjectLayer('objects');

    if (!objectLayer) {
      console.warn('No objects layer found in tilemap');
      return;
    }

    // Storage for different object types
    this.spawnPoints = {
      player: null,
      enemies: [],
      doors: [],
      elevators: [],
      stairs: [],
      conveyors: []
    };

    // Parse each object
    objectLayer.objects.forEach(obj => {
      const props = this.getObjectProperties(obj);

      switch (obj.name) {
        case 'player_spawn':
          this.spawnPoints.player = { x: obj.x, y: obj.y };
          console.log('Player spawn:', obj.x, obj.y);
          break;

        case 'enemy_spawn':
          this.spawnPoints.enemies.push({
            x: obj.x,
            y: obj.y,
            type: props.type || 'inspector'
          });
          console.log('Enemy spawn:', props.type, 'at', obj.x, obj.y);
          break;

        case 'door':
          this.spawnPoints.doors.push({
            x: obj.x,
            y: obj.y,
            floor: props.floor || 0
          });
          console.log('Door:', 'floor', props.floor, 'at', obj.x, obj.y);
          break;

        case 'elevator':
          this.spawnPoints.elevators.push({
            x: obj.x,
            y: obj.y,
            id: props.id || 0
          });
          console.log('Elevator:', props.id, 'at', obj.x, obj.y);
          break;

        case 'stairs':
          this.spawnPoints.stairs.push({
            x: obj.x,
            y: obj.y,
            connectsAbove: props.connects_floor_above,
            connectsBelow: props.connects_floor_below
          });
          console.log('Stairs: floors', props.connects_floor_below, '-', props.connects_floor_above, 'at', obj.x, obj.y);
          break;

        case 'conveyor':
          this.spawnPoints.conveyors.push({
            x: obj.x,
            y: obj.y,
            floor: props.floor || 0,
            direction: props.direction || 1,
            length: props.length || 64
          });
          console.log('Conveyor: floor', props.floor, 'dir', props.direction, 'at', obj.x, obj.y);
          break;
      }
    });

    // Log summary
    console.log('=== Objects Summary ===');
    console.log('Doors:', this.spawnPoints.doors.length);
    console.log('Elevators:', this.spawnPoints.elevators.length);
    console.log('Stairs:', this.spawnPoints.stairs.length);
    console.log('Enemies:', this.spawnPoints.enemies.length);
    console.log('Conveyors:', this.spawnPoints.conveyors.length);

    // Visualize spawn points for debugging
    this.visualizeSpawnPoints();
  }

  getObjectProperties(obj) {
    const props = {};
    if (obj.properties) {
      obj.properties.forEach(p => {
        props[p.name] = p.value;
      });
    }
    return props;
  }

  visualizeSpawnPoints() {
    // Draw markers for all spawn points (debug visualization)
    const graphics = this.add.graphics();
    graphics.setDepth(GAME.LAYER_HUD);

    // Player spawn - cyan
    if (this.spawnPoints.player) {
      graphics.fillStyle(C64_PALETTE.CYAN, 0.8);
      graphics.fillCircle(this.spawnPoints.player.x, this.spawnPoints.player.y, 4);
    }

    // Enemy spawns - red
    graphics.fillStyle(C64_PALETTE.RED, 0.8);
    this.spawnPoints.enemies.forEach(e => {
      graphics.fillCircle(e.x, e.y, 3);
    });

    // Doors - yellow
    graphics.fillStyle(C64_PALETTE.YELLOW, 0.8);
    this.spawnPoints.doors.forEach(d => {
      graphics.fillRect(d.x - 4, d.y - 8, 8, 16);
    });

    // Elevators - light blue vertical lines
    graphics.lineStyle(2, C64_PALETTE.LIGHT_BLUE, 0.8);
    this.spawnPoints.elevators.forEach(e => {
      graphics.lineBetween(e.x, 16, e.x, GAME.HEIGHT - 8);
    });

    // Stairs - green diagonal
    graphics.lineStyle(3, C64_PALETTE.GREEN, 0.8);
    this.spawnPoints.stairs.forEach(s => {
      graphics.lineBetween(s.x - 16, s.y + 24, s.x + 16, s.y - 24);
    });

    // Conveyors - orange horizontal
    graphics.lineStyle(2, C64_PALETTE.ORANGE, 0.8);
    this.spawnPoints.conveyors.forEach(c => {
      graphics.lineBetween(c.x, c.y, c.x + c.length, c.y);
    });
  }

  createTestPlayer() {
    // Create a test sprite at player spawn to verify collision
    const spawnX = this.spawnPoints.player ? this.spawnPoints.player.x : 32;
    const spawnY = this.spawnPoints.player ? this.spawnPoints.player.y : 176;

    this.testPlayer = this.physics.add.sprite(spawnX, spawnY, 'player', 0);
    this.testPlayer.setDepth(GAME.LAYER_PLAYER);
    this.testPlayer.setCollideWorldBounds(true);
    this.testPlayer.setBounce(0);

    // Add collision with tilemap
    if (this.collisionLayer) {
      this.physics.add.collider(this.testPlayer, this.collisionLayer);
    }

    // Play walk animation
    this.testPlayer.play('player_walk');
  }

  update(time, delta) {
    if (!this.testPlayer) return;

    // Reset velocity
    this.testPlayer.setVelocity(0);

    // Handle input
    if (this.cursors.left.isDown) {
      this.testPlayer.setVelocityX(-GAME.PLAYER_SPEED);
      this.testPlayer.setFlipX(true);
      this.testPlayer.play('player_walk', true);
    } else if (this.cursors.right.isDown) {
      this.testPlayer.setVelocityX(GAME.PLAYER_SPEED);
      this.testPlayer.setFlipX(false);
      this.testPlayer.play('player_walk', true);
    } else if (this.cursors.up.isDown) {
      this.testPlayer.setVelocityY(-GAME.PLAYER_SPEED);
      this.testPlayer.play('player_walk', true);
    } else if (this.cursors.down.isDown) {
      this.testPlayer.setVelocityY(GAME.PLAYER_SPEED);
      this.testPlayer.play('player_walk', true);
    } else {
      this.testPlayer.play('player_idle', true);
    }
  }
}
