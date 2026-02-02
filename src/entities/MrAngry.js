import Phaser from 'phaser';
import { GAME } from '../constants/game.js';
import { C64_PALETTE } from '../constants/palette.js';

/**
 * MrAngry - Special triggered enemy
 *
 * Mr. Angry is hidden behind a random door and awakens when the player
 * opens that door. He's faster than other enemies and pursues relentlessly.
 */
export class MrAngry extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemies', 12); // Frame 12 is Mr. Angry in enemies spritesheet

    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // State
    this.isAwake = false;
    this.moveSpeed = GAME.MR_ANGRY_SPEED;
    this.currentFloor = this.calculateFloor(y);

    // Configure physics body
    this.setupPhysics();

    // Set depth
    this.setDepth(GAME.LAYER_ENEMIES);

    // Start invisible (awakens with effect)
    this.setAlpha(0);
    this.setActive(false);
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
   * Awaken Mr. Angry with dramatic effect
   */
  awaken() {
    this.isAwake = true;
    this.setActive(true);

    // Dramatic fade-in
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.play('mr_angry_walk');
      }
    });

    console.log('Mr. Angry has awakened at floor', this.currentFloor);
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
   * Main update loop - simple chase AI
   * Full AI will be implemented in Phase 7
   */
  update(time, delta, player) {
    if (!this.isAwake || !player) {
      return;
    }

    // Update current floor
    this.currentFloor = this.calculateFloor(this.y);

    // Simple horizontal chase toward player on same floor
    if (this.currentFloor === player.state.currentFloor) {
      // Same floor - chase horizontally
      if (player.x < this.x) {
        this.setVelocityX(-this.moveSpeed);
        this.setFlipX(true);
      } else {
        this.setVelocityX(this.moveSpeed);
        this.setFlipX(false);
      }
      this.setVelocityY(0);
    } else {
      // Different floor - stop for now (Phase 7 will add pathfinding)
      this.setVelocity(0, 0);
    }

    // Play walk animation
    this.play('mr_angry_walk', true);
  }

  /**
   * Reset Mr. Angry (for new game)
   */
  reset() {
    this.isAwake = false;
    this.setActive(false);
    this.setAlpha(0);
    this.setVelocity(0, 0);
  }
}
