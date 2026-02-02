import Phaser from 'phaser';
import { GAME } from '../constants/game.js';
import { C64_PALETTE } from '../constants/palette.js';

/**
 * Enemy type configuration
 */
const ENEMY_CONFIG = {
  inspector: {
    frame: 0,  // First row in enemies spritesheet
    speed: GAME.ENEMY_SPEED,
    color: C64_PALETTE.RED
  },
  manager: {
    frame: 4,  // Second row
    speed: GAME.ENEMY_SPEED,
    color: C64_PALETTE.PURPLE
  },
  patron: {
    frame: 8,  // Third row
    speed: GAME.ENEMY_SPEED,
    color: C64_PALETTE.GREEN
  },
  mr_angry: {
    frame: 12, // Fourth row
    speed: GAME.MR_ANGRY_SPEED,
    color: C64_PALETTE.LIGHT_RED
  }
};

/**
 * Enemy - Base class for hotel staff enemies
 *
 * Enemies pursue the player using waypoint-based pathfinding.
 * They can use elevators and stairs but cannot traverse conveyor belts.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'inspector') {
    const config = ENEMY_CONFIG[type] || ENEMY_CONFIG.inspector;
    super(scene, x, y, 'enemies', config.frame);

    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Enemy type and config
    this.enemyType = type;
    this.config = config;
    this.moveSpeed = config.speed;

    // State management
    this.state = {
      isActive: true,
      isChasing: true,
      currentFloor: this.calculateFloor(y),
      isOnElevator: false,
      isOnStairs: false,
      targetPosition: null,
      nextWaypoint: null,
      useElevator: false,
      useStairs: false,
      pathfindTimer: 0
    };

    // Reference to current elevator/stairs
    this.currentElevator = null;
    this.currentStair = null;

    // Spawn position for respawn
    this.spawnPosition = { x, y };

    // Configure physics body
    this.setupPhysics();

    // Set depth
    this.setDepth(GAME.LAYER_ENEMIES);

    // Start with walk animation
    this.play(`${type}_walk`);
  }

  /**
   * Configure physics body
   */
  setupPhysics() {
    this.body.setSize(16, 18);
    this.body.setOffset(4, 3);
    this.setBounce(0);
    this.setCollideWorldBounds(true);
    this.body.setAllowGravity(false);
  }

  /**
   * Calculate which floor based on Y position
   */
  calculateFloor(y) {
    const floors = GAME.FLOORS;
    let closestFloor = 0;
    let closestDistance = Infinity;

    for (const [floor, floorY] of Object.entries(floors)) {
      const distance = Math.abs(y - floorY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestFloor = parseInt(floor);
      }
    }

    return closestFloor;
  }

  /**
   * Main update loop
   */
  update(time, delta) {
    if (!this.state.isActive) {
      return;
    }

    // Update current floor
    this.state.currentFloor = this.calculateFloor(this.y);

    // Play walk animation
    if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
      this.play(`${this.enemyType}_walk`, true);
    }
  }

  /**
   * Move toward a target X position
   */
  moveTowardX(targetX) {
    const dx = targetX - this.x;
    const threshold = 4;

    if (Math.abs(dx) > threshold) {
      this.setVelocityX(Math.sign(dx) * this.moveSpeed);
      this.setFlipX(dx < 0);
      return false; // Not at target yet
    } else {
      this.setVelocityX(0);
      this.x = targetX; // Snap to target
      return true; // At target
    }
  }

  /**
   * Move toward a target Y position (for stairs)
   */
  moveTowardY(targetY, speedMultiplier = 0.7) {
    const dy = targetY - this.y;
    const threshold = 4;

    if (Math.abs(dy) > threshold) {
      this.setVelocityY(Math.sign(dy) * this.moveSpeed * speedMultiplier);
      return false;
    } else {
      this.setVelocityY(0);
      this.y = targetY;
      return true;
    }
  }

  /**
   * Enter elevator mode
   */
  enterElevator(elevator) {
    this.state.isOnElevator = true;
    this.currentElevator = elevator;
    this.x = elevator.x;

    // Disable vertical collision
    this.body.checkCollision.up = false;
    this.body.checkCollision.down = false;
  }

  /**
   * Exit elevator mode
   */
  exitElevator() {
    this.state.isOnElevator = false;
    this.currentElevator = null;

    // Re-enable collision
    this.body.checkCollision.up = true;
    this.body.checkCollision.down = true;
  }

  /**
   * Enter stair mode
   */
  enterStairs(stair) {
    this.state.isOnStairs = true;
    this.currentStair = stair;
    this.x = stair.x;
  }

  /**
   * Exit stair mode
   */
  exitStairs() {
    this.state.isOnStairs = false;
    this.currentStair = null;
  }

  /**
   * Stop all movement
   */
  stop() {
    this.setVelocity(0, 0);
  }

  /**
   * Reset to spawn position
   */
  reset() {
    this.setPosition(this.spawnPosition.x, this.spawnPosition.y);
    this.state.currentFloor = this.calculateFloor(this.spawnPosition.y);
    this.state.isOnElevator = false;
    this.state.isOnStairs = false;
    this.state.targetPosition = null;
    this.state.nextWaypoint = null;
    this.currentElevator = null;
    this.currentStair = null;
    this.setVelocity(0, 0);
  }

  /**
   * Deactivate enemy
   */
  deactivate() {
    this.state.isActive = false;
    this.setVisible(false);
    this.setActive(false);
    this.body.enable = false;
  }

  /**
   * Activate enemy
   */
  activate() {
    this.state.isActive = true;
    this.setVisible(true);
    this.setActive(true);
    this.body.enable = true;
  }
}
