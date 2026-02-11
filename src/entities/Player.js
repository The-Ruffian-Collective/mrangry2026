import Phaser from 'phaser';
import { GAME } from '../constants/game.js';
import { C64_PALETTE } from '../constants/palette.js';

/**
 * Player - The freelance photographer protagonist
 *
 * Handles movement, state management, animations, and visual feedback
 * with authentic C64-era game feel: responsive controls, clear visual
 * states, and satisfying tactile feedback.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Core state
    this.state = {
      lives: GAME.STARTING_LIVES,
      inventory: {
        pass: false,
        key: false,
        camera: false,
        bulb: false
      },
      isDead: false,
      isRespawning: false,
      isOnElevator: false,
      isOnStairs: false,
      isOnConveyor: false,
      currentFloor: 0,
      facingDirection: 'right',
      lastSafePosition: { x, y },
      spawnPosition: { x, y }
    };

    this.score = 0;

    // Movement tuning for authentic retro feel
    this.moveSpeed = GAME.PLAYER_SPEED;
    this.conveyorPush = 0; // Current conveyor force being applied

    // Visual feedback systems
    this.dustEmitter = null;
    this.invulnerableTimer = 0;
    this.invulnerableDuration = 1500; // ms of invulnerability after respawn

    // Configure physics body
    this.setupPhysics();

    // Setup visual effects
    this.setupVisualEffects();

    // Set initial depth
    this.setDepth(GAME.LAYER_PLAYER);

    // Start idle
    this.play('player_idle');
  }

  /**
   * Configure physics body for precise collision
   */
  setupPhysics() {
    // Tighter hitbox for fair gameplay
    this.body.setSize(16, 18);
    this.body.setOffset(4, 3);

    // No bounce - instant stop on collision
    this.setBounce(0);

    // Keep in world bounds
    this.setCollideWorldBounds(true);

    // No gravity in this top-down-ish platformer
    this.body.setAllowGravity(false);
  }

  /**
   * Setup particle emitters and visual effect systems
   */
  setupVisualEffects() {
    // Create dust particle emitter for movement feedback
    // Using graphics-based particles for C64 authenticity
    this.dustParticles = this.scene.add.group({
      classType: DustParticle,
      maxSize: 8,
      runChildUpdate: true
    });
  }

  /**
   * Main update loop - called every frame
   */
  update(time, delta, inputState) {
    if (this.state.isDead || this.state.isRespawning) {
      return;
    }

    // Update invulnerability
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
      // Flicker effect during invulnerability
      this.setAlpha(Math.sin(time * 0.02) > 0 ? 1 : 0.3);
      if (this.invulnerableTimer <= 0) {
        this.setAlpha(1);
      }
    }

    // Handle movement based on current state
    if (this.state.isOnElevator) {
      this.handleElevatorMovement(inputState);
    } else if (this.state.isOnStairs) {
      this.handleStairMovement(inputState);
    } else {
      this.handleNormalMovement(inputState, delta);
    }

    // Update floor tracking
    this.updateCurrentFloor();

    // Store safe position periodically (not on stairs/elevator)
    if (!this.state.isOnStairs && !this.state.isOnElevator) {
      this.state.lastSafePosition = { x: this.x, y: this.y };
    }
  }

  /**
   * Handle standard horizontal movement
   */
  handleNormalMovement(input, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // Horizontal movement
    if (input.left) {
      velocityX = -this.moveSpeed;
      this.state.facingDirection = 'left';
      this.setFlipX(true);
      isMoving = true;
    } else if (input.right) {
      velocityX = this.moveSpeed;
      this.state.facingDirection = 'right';
      this.setFlipX(false);
      isMoving = true;
    }

    // Apply conveyor belt effect
    if (this.state.isOnConveyor && this.conveyorPush !== 0) {
      velocityX += this.conveyorPush;
      // Visual indication: slight tint when on conveyor
      this.setTint(C64_PALETTE.LIGHT_GRAY);
    } else {
      this.clearTint();
    }

    // Set velocity
    this.setVelocity(velocityX, velocityY);

    // Animation handling
    if (isMoving) {
      this.play('player_walk', true);
      // Spawn dust particles occasionally when moving
      if (Math.random() < 0.1) {
        this.spawnDustParticle();
      }
    } else if (this.state.isOnConveyor && this.conveyorPush !== 0) {
      // Sliding on conveyor - use walk animation but slower
      this.play('player_walk', true);
    } else {
      this.play('player_idle', true);
    }
  }

  /**
   * Handle movement while on elevator
   * Movement is controlled by ElevatorSystem, player just animates
   */
  handleElevatorMovement(input) {
    // Velocity controlled by ElevatorSystem
    this.setVelocity(0, 0);

    // Use climb animation while on elevator
    this.play('player_climb', true);
  }

  /**
   * Enter elevator mode
   */
  enterElevator(elevator) {
    this.state.isOnElevator = true;
    this.currentElevator = elevator;

    // Snap to elevator X position
    this.x = elevator.x;

    // Disable vertical collision to pass through floors
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
   * Handle movement while on stairs
   * Player moves diagonally, can exit at landings, falls if walking off mid-stair
   */
  handleStairMovement(input) {
    const stair = this.currentStair;
    if (!stair) {
      this.exitStairs();
      return;
    }

    // Get stair bounds from connected floors
    const topFloorY = GAME.FLOORS[stair.connectsAbove];
    const bottomFloorY = GAME.FLOORS[stair.connectsBelow];

    // Landing tolerance - how close to floor Y to be considered "at landing"
    const landingTolerance = 6;

    // Check if at a landing (top or bottom of stairs)
    const atTopLanding = this.y <= topFloorY + landingTolerance;
    const atBottomLanding = this.y >= bottomFloorY - landingTolerance;
    const atLanding = atTopLanding || atBottomLanding;

    // Handle horizontal input
    if (input.left || input.right) {
      if (atLanding) {
        // At landing - safe to exit
        // Snap to floor Y for clean exit
        if (atTopLanding) {
          this.y = topFloorY;
        } else {
          this.y = bottomFloorY;
        }
        this.exitStairs();
        return;
      } else {
        // Mid-stair - fall death!
        this.die('fall');
        return;
      }
    }

    // Handle vertical movement on stairs
    let velocityX = 0;
    let velocityY = 0;

    const stairSpeedY = this.moveSpeed * 0.7;
    const stairSpeedX = this.moveSpeed * 0.4;

    if (input.up && this.y > topFloorY) {
      // Move up-right (ascending stairs)
      velocityY = -stairSpeedY;
      velocityX = stairSpeedX;
      this.setFlipX(false);
    } else if (input.down && this.y < bottomFloorY) {
      // Move down-left (descending stairs)
      velocityY = stairSpeedY;
      velocityX = -stairSpeedX;
      this.setFlipX(true);
    }

    // Clamp to stair bounds
    if (this.y + velocityY * (1 / 60) < topFloorY) {
      this.y = topFloorY;
      velocityY = 0;
    }
    if (this.y + velocityY * (1 / 60) > bottomFloorY) {
      this.y = bottomFloorY;
      velocityY = 0;
    }

    this.setVelocity(velocityX, velocityY);

    // Animation
    if (velocityX !== 0 || velocityY !== 0) {
      this.play('player_climb', true);
    } else {
      this.play('player_idle', true);
    }
  }

  /**
   * Update current floor based on Y position
   */
  updateCurrentFloor() {
    const floors = GAME.FLOORS;
    let closestFloor = 0;
    let closestDistance = Infinity;

    for (const [floor, floorY] of Object.entries(floors)) {
      const distance = Math.abs(this.y - floorY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestFloor = parseInt(floor);
      }
    }

    this.state.currentFloor = closestFloor;
  }

  /**
   * Check if player is on a conveyor belt
   */
  checkConveyor(conveyors) {
    this.state.isOnConveyor = false;
    this.conveyorPush = 0;

    for (const conveyor of conveyors) {
      // Check if player is on this conveyor's floor and within its bounds
      if (this.state.currentFloor === conveyor.floor) {
        if (this.x >= conveyor.x && this.x <= conveyor.x + conveyor.length) {
          // Check Y proximity (within floor tolerance)
          const floorY = GAME.FLOORS[conveyor.floor];
          if (Math.abs(this.y - floorY) < 20) {
            this.state.isOnConveyor = true;
            this.conveyorPush = conveyor.direction * GAME.CONVEYOR_SPEED;
            return;
          }
        }
      }
    }
  }

  /**
   * Check if player is near stairs
   */
  checkStairs(stairs) {
    const stairProximity = 20;

    for (const stair of stairs) {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, stair.x, stair.y);
      if (distance < stairProximity) {
        // Near stairs - allow entry
        return stair;
      }
    }
    return null;
  }

  /**
   * Enter stair mode
   */
  enterStairs(stair) {
    this.state.isOnStairs = true;
    this.currentStair = stair;

    // Snap to stair center X
    this.x = stair.x;

    // Store stair Y bounds for reference
    this.stairTopY = GAME.FLOORS[stair.connectsAbove];
    this.stairBottomY = GAME.FLOORS[stair.connectsBelow];
  }

  /**
   * Exit stair mode
   */
  exitStairs() {
    this.state.isOnStairs = false;
    this.currentStair = null;
  }

  /**
   * Spawn a dust particle at player's feet
   */
  spawnDustParticle() {
    const dust = this.dustParticles.get();
    if (dust) {
      const offsetX = this.state.facingDirection === 'right' ? -8 : 8;
      dust.spawn(this.x + offsetX, this.y + 8);
    }
  }

  /**
   * Collect an item
   */
  collectItem(itemType) {
    if (this.state.inventory[itemType]) {
      return false; // Already have it
    }

    this.state.inventory[itemType] = true;

    // Add score
    const scoreKey = `SCORE_${itemType.toUpperCase()}`;
    if (GAME[scoreKey]) {
      this.score += GAME[scoreKey];
    }

    // Visual feedback: brief flash
    this.scene.cameras.main.flash(100, 184, 199, 111, true); // C64 Yellow flash

    return true;
  }

  /**
   * Check if player has all required items
   */
  hasAllItems() {
    const inv = this.state.inventory;
    return inv.pass && inv.key && inv.camera && inv.bulb;
  }

  /**
   * Get count of collected items
   */
  getItemCount() {
    const inv = this.state.inventory;
    return [inv.pass, inv.key, inv.camera, inv.bulb].filter(Boolean).length;
  }

  /**
   * Check if player is currently invulnerable
   */
  isInvulnerable() {
    return this.invulnerableTimer > 0;
  }

  /**
   * Trigger player death
   */
  die(cause = 'enemy') {
    if (this.state.isDead || this.isInvulnerable()) {
      return;
    }

    this.state.isDead = true;
    this.state.lives--;

    // Stop movement
    this.setVelocity(0, 0);

    // Play death animation
    this.play('player_death');

    // Screen shake for impact
    this.scene.cameras.main.shake(200, 0.01);

    // Red flash
    this.scene.cameras.main.flash(150, 104, 55, 43, true); // C64 Red flash

    // Death sequence - coordinated through scene for full system reset
    this.scene.time.delayedCall(800, () => {
      if (this.state.lives > 0) {
        this.scene.handleRespawn();
      } else {
        // Game over
        this.scene.handleGameOver();
      }
    });
  }

  /**
   * Respawn player at spawn point
   */
  respawn() {
    this.state.isRespawning = true;
    this.state.isDead = false;

    // Reset position
    this.setPosition(this.state.spawnPosition.x, this.state.spawnPosition.y);

    // Reset states
    this.state.isOnElevator = false;
    this.state.isOnStairs = false;
    this.state.isOnConveyor = false;
    this.conveyorPush = 0;

    // Brief invulnerability
    this.invulnerableTimer = this.invulnerableDuration;

    // Fade in effect
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.state.isRespawning = false;
        this.play('player_idle');
      }
    });
  }

  /**
   * Reset player for new level/game
   */
  reset() {
    this.state.lives = GAME.STARTING_LIVES;
    this.state.inventory = {
      pass: false,
      key: false,
      camera: false,
      bulb: false
    };
    this.state.isDead = false;
    this.state.isRespawning = false;
    this.score = 0;
    this.invulnerableTimer = 0;
    this.setAlpha(1);
    this.setPosition(this.state.spawnPosition.x, this.state.spawnPosition.y);
    this.play('player_idle');
  }
}

/**
 * DustParticle - Simple particle for movement feedback
 * Uses C64-authentic single-pixel aesthetic
 */
class DustParticle extends Phaser.GameObjects.Rectangle {
  constructor(scene) {
    super(scene, 0, 0, 2, 2, C64_PALETTE.MEDIUM_GRAY);
    this.setOrigin(0.5);
    this.lifespan = 0;
    this.maxLifespan = 300;
    this.velocityX = 0;
    this.velocityY = 0;
    this.setActive(false);
    this.setVisible(false);
  }

  spawn(x, y) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setAlpha(0.8);
    this.lifespan = this.maxLifespan;

    // Random drift
    this.velocityX = (Math.random() - 0.5) * 20;
    this.velocityY = -10 - Math.random() * 10;
  }

  update(time, delta) {
    if (!this.active) return;

    this.lifespan -= delta;

    if (this.lifespan <= 0) {
      this.setActive(false);
      this.setVisible(false);
      return;
    }

    // Move and fade
    this.x += this.velocityX * (delta / 1000);
    this.y += this.velocityY * (delta / 1000);
    this.velocityY += 30 * (delta / 1000); // Slight gravity

    // Fade out
    this.setAlpha((this.lifespan / this.maxLifespan) * 0.8);
  }
}
