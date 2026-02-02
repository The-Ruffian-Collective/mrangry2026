import Phaser from 'phaser';
import { GAME } from '../constants/game.js';
import { C64_PALETTE } from '../constants/palette.js';

/**
 * ElevatorSystem - Manages elevator platforms and vertical traversal
 *
 * Handles creation, movement, and rider management for all elevators.
 * Elevators span all floors and can carry player or enemies.
 */
export class ElevatorSystem {
  constructor(scene) {
    this.scene = scene;
    this.elevators = [];

    // Floor Y positions for snapping
    this.floorPositions = Object.values(GAME.FLOORS);
  }

  /**
   * Create elevator platforms from tilemap data
   */
  createElevators(elevatorData) {
    elevatorData.forEach(data => {
      const elevator = {
        id: data.id,
        x: data.x,
        minY: GAME.FLOORS[3], // Top floor
        maxY: GAME.FLOORS[0], // Bottom floor
        platform: null,
        rider: null,
        isMoving: false,
        direction: 0
      };

      // Create platform sprite as a simple rectangle
      // Position at bottom floor initially
      elevator.platform = this.scene.add.rectangle(
        data.x,
        GAME.FLOORS[0],
        16,
        4,
        C64_PALETTE.LIGHT_GRAY
      );
      elevator.platform.setDepth(GAME.LAYER_TILES + 0.5);
      elevator.platform.setOrigin(0.5, 0.5);

      this.elevators.push(elevator);
    });

    console.log(`Created ${this.elevators.length} elevators`);
  }

  /**
   * Update all elevators each frame
   */
  update(delta) {
    this.elevators.forEach(elevator => {
      if (elevator.isMoving && elevator.rider) {
        this.moveElevator(elevator, delta);
      }
    });
  }

  /**
   * Move elevator and rider vertically
   */
  moveElevator(elevator, delta) {
    const speed = GAME.ELEVATOR_SPEED * (delta / 1000) * 60;
    const movement = elevator.direction * speed;

    let newY = elevator.platform.y + movement;

    // Clamp to bounds
    newY = Phaser.Math.Clamp(newY, elevator.minY, elevator.maxY);

    // Update platform position
    elevator.platform.y = newY;

    // Update rider position
    if (elevator.rider) {
      elevator.rider.y = newY;
    }

    // Stop at bounds
    if (newY === elevator.minY || newY === elevator.maxY) {
      this.stopMoving(elevator);
    }
  }

  /**
   * Find elevator platform near a position
   */
  getNearbyElevator(x, y, threshold = 20) {
    return this.elevators.find(e => {
      const distX = Math.abs(e.x - x);
      const distY = Math.abs(e.platform.y - y);
      return distX < threshold && distY < threshold;
    });
  }

  /**
   * Player/entity enters elevator
   */
  enterElevator(entity, elevator) {
    if (elevator.rider) {
      return false; // Already occupied
    }

    elevator.rider = entity;

    // Use entity's enterElevator method if available
    if (entity.enterElevator) {
      entity.enterElevator(elevator);
    } else {
      entity.state.isOnElevator = true;
      entity.x = elevator.x;
    }

    // Snap elevator platform to entity's Y
    elevator.platform.y = entity.y;

    console.log(`Entity entered elevator ${elevator.id}`);
    return true;
  }

  /**
   * Player/entity exits elevator
   */
  exitElevator(entity, elevator) {
    elevator.rider = null;
    elevator.isMoving = false;
    elevator.direction = 0;

    // Use entity's exitElevator method if available
    if (entity.exitElevator) {
      entity.exitElevator();
    } else {
      entity.state.isOnElevator = false;
    }

    // Snap to nearest floor for clean exit
    entity.y = this.snapToFloor(entity.y);

    console.log(`Entity exited elevator ${elevator.id}`);
  }

  /**
   * Start elevator moving in direction
   */
  startMoving(elevator, direction) {
    if (!elevator.rider) return;

    elevator.isMoving = true;
    elevator.direction = direction;
  }

  /**
   * Stop elevator movement
   */
  stopMoving(elevator) {
    elevator.isMoving = false;
    elevator.direction = 0;
  }

  /**
   * Check if Y position is at a floor level
   */
  isAtFloor(y, tolerance = 4) {
    return this.floorPositions.some(floorY => Math.abs(y - floorY) < tolerance);
  }

  /**
   * Snap Y to nearest floor position
   */
  snapToFloor(y) {
    return this.floorPositions.reduce(
      (nearest, floorY) =>
        Math.abs(floorY - y) < Math.abs(nearest - y) ? floorY : nearest,
      this.floorPositions[0]
    );
  }

  /**
   * Get elevator by ID
   */
  getElevatorById(id) {
    return this.elevators.find(e => e.id === id);
  }
}
