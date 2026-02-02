import Phaser from 'phaser';
import { C64_PALETTE } from '../constants/palette.js';
import { GAME } from '../constants/game.js';
import { Player } from '../entities/Player.js';
import { ElevatorSystem } from '../systems/ElevatorSystem.js';

/**
 * GameScene - Main gameplay scene
 *
 * Handles level rendering, player control, collision detection,
 * and game state management. Phase 4 focuses on player movement.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor(C64_PALETTE.BLUE);

    // Game state
    this.isPaused = false;
    this.isGameOver = false;

    // Create tilemap
    this.createLevel();

    // Parse object layer for spawn points
    this.parseObjects();

    // Create player
    this.createPlayer();

    // Setup input handling
    this.setupInput();

    // Setup collisions
    this.setupCollisions();

    // Create HUD (minimal for Phase 4)
    this.createHUD();

    // Create elevator system (Phase 5)
    this.elevatorSystem = new ElevatorSystem(this);
    this.elevatorSystem.createElevators(this.spawnPoints.elevators);

    // Debug visualization (toggle with D key)
    this.debugGraphics = null;
    this.showDebug = false;
  }

  /**
   * Create and configure the tilemap
   */
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

      // Set collision on floor tiles (tile index 1 = floor)
      // Exclude empty (0) and special tiles from collision
      this.collisionLayer.setCollisionByExclusion([-1, 0]);
    }

    console.log('Level loaded:', this.map.width, 'x', this.map.height, 'tiles');
  }

  /**
   * Parse objects layer from tilemap
   */
  parseObjects() {
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
          break;

        case 'enemy_spawn':
          this.spawnPoints.enemies.push({
            x: obj.x,
            y: obj.y,
            type: props.type || 'inspector'
          });
          break;

        case 'door':
          this.spawnPoints.doors.push({
            x: obj.x,
            y: obj.y,
            floor: props.floor || 0
          });
          break;

        case 'elevator':
          this.spawnPoints.elevators.push({
            x: obj.x,
            y: obj.y,
            id: props.id || 0
          });
          break;

        case 'stairs':
          this.spawnPoints.stairs.push({
            x: obj.x,
            y: obj.y,
            connectsAbove: props.connects_floor_above,
            connectsBelow: props.connects_floor_below
          });
          break;

        case 'conveyor':
          this.spawnPoints.conveyors.push({
            x: obj.x,
            y: obj.y,
            floor: props.floor || 0,
            direction: props.direction || 1,
            length: props.length || 64
          });
          break;
      }
    });

    // Log summary
    console.log('=== Level Objects ===');
    console.log('Doors:', this.spawnPoints.doors.length);
    console.log('Elevators:', this.spawnPoints.elevators.length);
    console.log('Stairs:', this.spawnPoints.stairs.length);
    console.log('Conveyors:', this.spawnPoints.conveyors.length);
  }

  /**
   * Extract properties from tilemap object
   */
  getObjectProperties(obj) {
    const props = {};
    if (obj.properties) {
      obj.properties.forEach(p => {
        props[p.name] = p.value;
      });
    }
    return props;
  }

  /**
   * Create the player entity
   */
  createPlayer() {
    const spawnX = this.spawnPoints.player ? this.spawnPoints.player.x : 32;
    const spawnY = this.spawnPoints.player ? this.spawnPoints.player.y : 176;

    this.player = new Player(this, spawnX, spawnY);

    console.log('Player spawned at:', spawnX, spawnY);
  }

  /**
   * Setup keyboard and gamepad input
   */
  setupInput() {
    // Arrow keys
    this.cursors = this.input.keyboard.createCursorKeys();

    // WASD keys
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Action keys
    this.actionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.muteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // Scene navigation (dev mode)
    this.input.keyboard.on('keydown-G', () => {
      this.handleGameOver();
    });

    this.input.keyboard.on('keydown-M', () => {
      this.scene.start('MenuScene');
    });

    // Pause toggle
    this.pauseKey.on('down', () => {
      this.togglePause();
    });

    // Debug toggle
    this.debugKey.on('down', () => {
      this.toggleDebug();
    });
  }

  /**
   * Setup physics collisions
   */
  setupCollisions() {
    if (this.collisionLayer && this.player) {
      this.physics.add.collider(this.player, this.collisionLayer);
    }
  }

  /**
   * Create minimal HUD for Phase 4
   */
  createHUD() {
    // Lives display
    this.livesText = this.add.text(8, 4, '', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#FFFFFF'
    }).setDepth(GAME.LAYER_HUD);

    // Floor indicator
    this.floorText = this.add.text(GAME.WIDTH - 8, 4, '', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#B8C76F'
    }).setOrigin(1, 0).setDepth(GAME.LAYER_HUD);

    // Score display
    this.scoreText = this.add.text(GAME.WIDTH / 2, 4, '', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#FFFFFF'
    }).setOrigin(0.5, 0).setDepth(GAME.LAYER_HUD);

    // Control hints (bottom)
    this.hintsText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 8, 'ARROWS/WASD: Move | P: Pause | D: Debug', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: '#6C6C6C'
    }).setOrigin(0.5, 1).setDepth(GAME.LAYER_HUD);

    // Pause overlay (hidden initially)
    this.pauseOverlay = this.add.rectangle(
      GAME.WIDTH / 2,
      GAME.HEIGHT / 2,
      GAME.WIDTH,
      GAME.HEIGHT,
      0x000000,
      0.7
    ).setDepth(GAME.LAYER_HUD + 1).setVisible(false);

    this.pauseText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2, 'PAUSED', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#B8C76F'
    }).setOrigin(0.5).setDepth(GAME.LAYER_HUD + 2).setVisible(false);
  }

  /**
   * Update HUD displays
   */
  updateHUD() {
    if (!this.player) return;

    // Lives with heart symbols
    const hearts = '\u2665'.repeat(this.player.state.lives);
    this.livesText.setText(hearts);

    // Floor number
    this.floorText.setText(`F${this.player.state.currentFloor}`);

    // Score
    this.scoreText.setText(this.player.score.toString().padStart(6, '0'));
  }

  /**
   * Get current input state
   */
  getInputState() {
    return {
      left: this.cursors.left.isDown || this.wasd.left.isDown,
      right: this.cursors.right.isDown || this.wasd.right.isDown,
      up: this.cursors.up.isDown || this.wasd.up.isDown,
      down: this.cursors.down.isDown || this.wasd.down.isDown,
      action: Phaser.Input.Keyboard.JustDown(this.actionKey)
    };
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseOverlay.setVisible(this.isPaused);
    this.pauseText.setVisible(this.isPaused);

    if (this.isPaused) {
      this.physics.pause();
    } else {
      this.physics.resume();
    }
  }

  /**
   * Toggle debug visualization
   */
  toggleDebug() {
    this.showDebug = !this.showDebug;

    if (this.showDebug) {
      this.createDebugVisualization();
    } else if (this.debugGraphics) {
      this.debugGraphics.destroy();
      this.debugGraphics = null;
    }
  }

  /**
   * Create debug visualization overlay
   */
  createDebugVisualization() {
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
    }

    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setDepth(GAME.LAYER_HUD);

    // Player spawn - cyan circle
    if (this.spawnPoints.player) {
      this.debugGraphics.fillStyle(C64_PALETTE.CYAN, 0.6);
      this.debugGraphics.fillCircle(this.spawnPoints.player.x, this.spawnPoints.player.y, 6);
    }

    // Enemy spawns - red circles
    this.debugGraphics.fillStyle(C64_PALETTE.RED, 0.6);
    this.spawnPoints.enemies.forEach(e => {
      this.debugGraphics.fillCircle(e.x, e.y, 4);
    });

    // Doors - yellow rectangles
    this.debugGraphics.fillStyle(C64_PALETTE.YELLOW, 0.6);
    this.spawnPoints.doors.forEach(d => {
      this.debugGraphics.fillRect(d.x - 4, d.y - 12, 8, 24);
    });

    // Elevators - light blue vertical lines
    this.debugGraphics.lineStyle(3, C64_PALETTE.LIGHT_BLUE, 0.6);
    this.spawnPoints.elevators.forEach(e => {
      this.debugGraphics.lineBetween(e.x, 16, e.x, GAME.HEIGHT - 8);
    });

    // Stairs - green diagonal lines
    this.debugGraphics.lineStyle(4, C64_PALETTE.GREEN, 0.6);
    this.spawnPoints.stairs.forEach(s => {
      this.debugGraphics.lineBetween(s.x - 20, s.y + 30, s.x + 20, s.y - 30);
    });

    // Conveyors - orange horizontal lines with arrows
    this.debugGraphics.lineStyle(3, C64_PALETTE.ORANGE, 0.8);
    this.spawnPoints.conveyors.forEach(c => {
      this.debugGraphics.lineBetween(c.x, c.y, c.x + c.length, c.y);
      // Direction arrow
      const arrowX = c.direction > 0 ? c.x + c.length - 8 : c.x + 8;
      const arrowDir = c.direction > 0 ? 1 : -1;
      this.debugGraphics.lineBetween(arrowX, c.y, arrowX - 6 * arrowDir, c.y - 4);
      this.debugGraphics.lineBetween(arrowX, c.y, arrowX - 6 * arrowDir, c.y + 4);
    });

    // Floor lines
    this.debugGraphics.lineStyle(1, C64_PALETTE.DARK_GRAY, 0.4);
    Object.entries(GAME.FLOORS).forEach(([floor, y]) => {
      this.debugGraphics.lineBetween(0, y, GAME.WIDTH, y);
    });
  }

  /**
   * Handle game over
   */
  handleGameOver() {
    this.isGameOver = true;
    this.scene.start('GameOverScene', {
      score: this.player ? this.player.score : 0
    });
  }

  /**
   * Handle elevator input - entry, movement, and exit
   */
  handleElevatorInput(input) {
    const player = this.player;

    if (player.state.isOnElevator) {
      // Already on elevator - handle movement and exit
      const elevator = player.currentElevator;

      if (input.up) {
        this.elevatorSystem.startMoving(elevator, -1); // Up
      } else if (input.down) {
        this.elevatorSystem.startMoving(elevator, 1); // Down
      } else {
        this.elevatorSystem.stopMoving(elevator);
      }

      // Exit on horizontal input (only at floor level)
      if ((input.left || input.right) && this.elevatorSystem.isAtFloor(player.y)) {
        this.elevatorSystem.exitElevator(player, elevator);
      }
    } else if (!player.state.isOnStairs) {
      // Not on elevator or stairs - check for entry
      if (input.up || input.down) {
        const elevator = this.elevatorSystem.getNearbyElevator(player.x, player.y, 20);
        if (elevator) {
          this.elevatorSystem.enterElevator(player, elevator);
          if (input.up) {
            this.elevatorSystem.startMoving(elevator, -1);
          } else {
            this.elevatorSystem.startMoving(elevator, 1);
          }
        }
      }
    }
  }

  /**
   * Handle stair input - entry only (exit handled by Player)
   */
  handleStairInput(input) {
    const player = this.player;

    if (player.state.isOnStairs || player.state.isOnElevator) {
      // Already on stairs or elevator - exit handled by Player.handleStairMovement
      return;
    }

    // Check for stair entry on up/down press
    if (input.up || input.down) {
      const nearStairs = player.checkStairs(this.spawnPoints.stairs);
      if (nearStairs) {
        player.enterStairs(nearStairs);
      }
    }
  }

  /**
   * Main update loop
   */
  update(time, delta) {
    if (this.isPaused || this.isGameOver) {
      return;
    }

    if (!this.player) {
      return;
    }

    // Get input state
    const input = this.getInputState();

    // Update elevator system
    this.elevatorSystem.update(delta);

    // Handle elevator input (entry, movement, exit)
    this.handleElevatorInput(input);

    // Handle stair input (entry only - exit handled by Player)
    this.handleStairInput(input);

    // Check conveyor collisions (only when not on elevator/stairs)
    if (!this.player.state.isOnElevator && !this.player.state.isOnStairs) {
      this.player.checkConveyor(this.spawnPoints.conveyors);
    }

    // Update player
    this.player.update(time, delta, input);

    // Update HUD
    this.updateHUD();

    // Update debug visualization if active
    if (this.showDebug && this.debugGraphics) {
      // Redraw player position indicator
      this.debugGraphics.fillStyle(C64_PALETTE.WHITE, 1);
      this.debugGraphics.fillCircle(this.player.x, this.player.y, 2);
    }
  }
}
