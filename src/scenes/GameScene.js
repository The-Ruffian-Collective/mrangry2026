import Phaser from 'phaser';
import { C64_PALETTE, C64_PALETTE_HEX } from '../constants/palette.js';
import { GAME } from '../constants/game.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { ElevatorSystem } from '../systems/ElevatorSystem.js';
import { DoorManager } from '../systems/DoorManager.js';
import { EnemyAI } from '../systems/EnemyAI.js';
import { MrAngry } from '../entities/MrAngry.js';
import { TimerSystem } from '../systems/TimerSystem.js';
import { SoundManager } from '../audio/SoundManager.js';
import { HUD } from '../ui/HUD.js';

/**
 * GameScene - Main gameplay scene
 *
 * Handles level rendering, player control, collision detection,
 * and game state management. Phase 8 adds win condition, timer, and audio.
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
    this.isWin = false;
    this.lastWarningBeep = 0;

    // Create sound manager first (Phase 8)
    this.soundManager = new SoundManager(this);
    this.soundManager.init();

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

    // Create elevator system (Phase 5)
    this.elevatorSystem = new ElevatorSystem(this);
    this.elevatorSystem.createElevators(this.spawnPoints.elevators);

    // Create door manager (Phase 6)
    this.doorManager = new DoorManager(this);
    this.doorManager.createDoors(this.spawnPoints.doors);

    // Setup item collection
    this.setupItemCollection();

    // Create enemy AI system (Phase 7)
    this.enemyAI = new EnemyAI(this);
    this.enemyAI.init({
      elevators: this.spawnPoints.elevators,
      stairs: this.spawnPoints.stairs,
      conveyors: this.spawnPoints.conveyors
    });

    // Create enemies group and spawn initial enemies (Phase 7)
    this.enemies = this.physics.add.group();
    this.createEnemies();

    // Listen for Mr. Angry awakening event
    this.mrAngry = null;
    this.events.on('mrAngryAwakened', this.spawnMrAngry, this);

    // Create timer system (Phase 8)
    this.timerSystem = new TimerSystem(this);
    this.setupTimerCallbacks();
    this.timerSystem.start();

    // Create HUD (Phase 8 - new proper HUD class)
    this.hud = new HUD(this);

    // Create pause overlay
    this.createPauseOverlay();

    // Debug visualization (toggle with D key)
    this.debugGraphics = null;
    this.debugDynamicGraphics = null;
    this.showDebug = false;
  }

  /**
   * Setup timer callbacks for warning and expiration
   */
  setupTimerCallbacks() {
    this.timerSystem.onWarning = () => {
      this.soundManager.play('timer_warning');
      console.log('Timer warning: 30 seconds remaining!');
    };

    this.timerSystem.onExpire = () => {
      console.log('Timer expired!');
      if (!this.player.state.isDead) {
        this.player.die('timer');
      }
    };
  }

  /**
   * Create pause overlay
   */
  createPauseOverlay() {
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

    this.pauseHints = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2 + 30, 'P: Resume  M: Mute', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#6C6C6C'
    }).setOrigin(0.5).setDepth(GAME.LAYER_HUD + 2).setVisible(false);
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
   * Create initial enemies (Inspector, Manager, Patron)
   */
  createEnemies() {
    this.spawnPoints.enemies.forEach(spawnPoint => {
      const enemy = new Enemy(this, spawnPoint.x, spawnPoint.y, spawnPoint.type);

      // Add to enemies group
      this.enemies.add(enemy);

      // Add collision with collision layer
      this.physics.add.collider(enemy, this.collisionLayer);

      console.log(`Spawned ${spawnPoint.type} at:`, spawnPoint.x, spawnPoint.y);
    });

    // Setup enemy-player collision
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleEnemyCollision,
      null,
      this
    );

    console.log(`Created ${this.enemies.getLength()} enemies`);
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

    // Pause toggle
    this.pauseKey.on('down', () => {
      this.togglePause();
    });

    // Mute toggle (Phase 8)
    this.muteKey.on('down', () => {
      this.soundManager.toggleMute();
      this.soundManager.play('ui_select');
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
   * Setup item collection overlap
   */
  setupItemCollection() {
    // Add overlap between player and items
    this.physics.add.overlap(
      this.player,
      this.doorManager.getItems(),
      this.handleItemCollection,
      null,
      this
    );
  }

  /**
   * Handle item collection
   */
  handleItemCollection(player, item) {
    const itemType = this.doorManager.collectItem(item);
    if (itemType) {
      player.collectItem(itemType);
      this.soundManager.play('item_pickup');
      console.log(`Collected: ${itemType}`);

      // Check if all items collected
      if (player.hasAllItems()) {
        this.hud.showAllItemsCollected();
      }
    }
  }

  /**
   * Spawn Mr. Angry when his door is opened
   */
  spawnMrAngry(data) {
    if (this.mrAngry) {
      return; // Already spawned
    }

    this.mrAngry = new MrAngry(this, data.x, data.y);
    this.mrAngry.awaken();

    // Play awakening sound
    this.soundManager.play('mr_angry_wake');

    // Add collision with collision layer
    this.physics.add.collider(this.mrAngry, this.collisionLayer);

    // Add overlap with player for death
    this.physics.add.overlap(
      this.player,
      this.mrAngry,
      this.handleEnemyCollision,
      null,
      this
    );

    console.log('Mr. Angry spawned!');
  }

  /**
   * Handle collision between player and enemy
   */
  handleEnemyCollision(player, enemy) {
    if (!player.isInvulnerable()) {
      this.soundManager.play('death');
      player.die('enemy');
    }
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
    this.pauseHints.setVisible(this.isPaused);

    if (this.isPaused) {
      this.physics.pause();
      this.timerSystem.pause();
    } else {
      this.physics.resume();
      this.timerSystem.resume();
    }
  }

  /**
   * Toggle debug visualization
   */
  toggleDebug() {
    this.showDebug = !this.showDebug;

    if (this.showDebug) {
      this.createDebugVisualization();
      // Create separate graphics for dynamic elements
      this.debugDynamicGraphics = this.add.graphics();
      this.debugDynamicGraphics.setDepth(GAME.LAYER_HUD + 1);
    } else {
      if (this.debugGraphics) {
        this.debugGraphics.destroy();
        this.debugGraphics = null;
      }
      if (this.debugDynamicGraphics) {
        this.debugDynamicGraphics.destroy();
        this.debugDynamicGraphics = null;
      }
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
   * Handle game over (lose condition)
   */
  handleGameOver() {
    this.isGameOver = true;
    this.timerSystem.stop();
    this.soundManager.play('game_over');
    this.scene.start('GameOverScene', {
      score: this.player ? this.player.score : 0,
      isWin: false,
      timeRemaining: this.timerSystem.getTimeRemaining()
    });
  }

  /**
   * Handle win condition (photographed Polly)
   */
  handleWin() {
    this.isWin = true;
    this.isGameOver = true;
    this.timerSystem.stop();

    // Calculate time bonus
    const timeBonus = this.timerSystem.getTimeRemaining() * GAME.SCORE_TIME_BONUS;
    this.player.score += GAME.SCORE_PHOTOGRAPH + timeBonus;

    // Play victory sound
    this.soundManager.play('level_complete');

    // Show win message
    this.hud.showWinMessage();

    // Camera flash for photograph effect
    this.cameras.main.flash(500, 255, 255, 255, true);

    // Transition to game over scene after delay
    this.time.delayedCall(2500, () => {
      this.scene.start('GameOverScene', {
        score: this.player.score,
        isWin: true,
        timeRemaining: this.timerSystem.getTimeRemaining()
      });
    });
  }

  /**
   * Try to photograph Polly (win condition check)
   */
  tryPhotographPolly() {
    // Check if player has all items
    if (!this.player.hasAllItems()) {
      this.hud.showNeedItems(this.player.getItemCount());
      return false;
    }

    // Check if at Polly's door and it's open
    if (this.doorManager.isPollyDoorOpen()) {
      this.soundManager.play('photograph');
      this.handleWin();
      return true;
    }

    return false;
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
   * Handle door interaction (action key)
   */
  handleDoorInput(input) {
    if (input.action) {
      // First check if we can photograph Polly (at open Polly door with all items)
      if (this.doorManager.isPollyDoorOpen() && this.player.hasAllItems()) {
        this.tryPhotographPolly();
        return;
      }

      // Check if near Polly's door without all items
      const nearbyDoor = this.doorManager.findNearbyDoor(this.player.x, this.player.y);
      if (nearbyDoor && nearbyDoor === this.doorManager.pollyDoor) {
        if (!this.player.hasAllItems()) {
          this.hud.showNeedItems(this.player.getItemCount());
          return;
        }
      }

      // Try to interact with nearby door
      const didInteract = this.doorManager.interactWithDoor(this.player);
      if (didInteract) {
        this.soundManager.play('door_open');
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

    // Update timer system (Phase 8)
    this.timerSystem.update(delta);

    // Play warning beeps periodically when in warning state
    if (this.timerSystem.isWarning()) {
      if (time - this.lastWarningBeep > 1000) {
        this.soundManager.playWarningBeep();
        this.lastWarningBeep = time;
      }
    }

    // Update elevator system
    this.elevatorSystem.update(delta);

    // Update door manager
    this.doorManager.update(delta);

    // Handle elevator input (entry, movement, exit)
    this.handleElevatorInput(input);

    // Handle stair input (entry only - exit handled by Player)
    this.handleStairInput(input);

    // Handle door interaction (action key)
    this.handleDoorInput(input);

    // Check conveyor collisions (only when not on elevator/stairs)
    if (!this.player.state.isOnElevator && !this.player.state.isOnStairs) {
      this.player.checkConveyor(this.spawnPoints.conveyors);
    }

    // Update player
    this.player.update(time, delta, input);

    // Update enemies via AI system (Phase 7)
    if (this.enemyAI && this.enemies) {
      // Get all enemies including Mr. Angry
      const allEnemies = this.enemies.getChildren().slice();
      if (this.mrAngry && this.mrAngry.isAwake) {
        allEnemies.push(this.mrAngry);
      }
      this.enemyAI.update(allEnemies, this.player, delta);
    }

    // Update individual enemy sprites
    this.enemies.getChildren().forEach(enemy => {
      enemy.update(time, delta);
    });

    // Update Mr. Angry if spawned (for animation)
    if (this.mrAngry && this.mrAngry.isAwake) {
      this.mrAngry.update(time, delta, this.player);
    }

    // Update HUD (Phase 8)
    this.hud.update(this.player, this.timerSystem, this.soundManager);

    // Update debug visualization if active
    if (this.showDebug && this.debugDynamicGraphics) {
      // Clear dynamic graphics and redraw player/enemy positions
      this.debugDynamicGraphics.clear();

      // Player position - white circle
      this.debugDynamicGraphics.fillStyle(C64_PALETTE.WHITE, 1);
      this.debugDynamicGraphics.fillCircle(this.player.x, this.player.y, 3);

      // Enemy positions - red circles
      this.debugDynamicGraphics.fillStyle(C64_PALETTE.LIGHT_RED, 0.8);
      this.enemies.getChildren().forEach(enemy => {
        this.debugDynamicGraphics.fillCircle(enemy.x, enemy.y, 3);
      });

      // Mr. Angry position - orange circle
      if (this.mrAngry && this.mrAngry.isAwake) {
        this.debugDynamicGraphics.fillStyle(C64_PALETTE.ORANGE, 1);
        this.debugDynamicGraphics.fillCircle(this.mrAngry.x, this.mrAngry.y, 4);
      }
    }
  }
}
