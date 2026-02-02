import { GAME } from '../constants/game.js';

/**
 * EnemyAI - Waypoint-based pathfinding system for enemies
 *
 * Manages enemy pursuit behavior across the 4-floor hotel.
 * Enemies use elevators and stairs to reach the player but cannot
 * traverse conveyor belts.
 */
export class EnemyAI {
  constructor(scene) {
    this.scene = scene;
    this.navGraph = null;

    // Store references to level data
    this.elevators = [];
    this.stairs = [];
    this.conveyors = [];
  }

  /**
   * Initialize with level data
   */
  init(levelData) {
    this.elevators = levelData.elevators || [];
    this.stairs = levelData.stairs || [];
    this.conveyors = levelData.conveyors || [];

    this.navGraph = this.buildNavGraph();
  }

  /**
   * Build navigation graph from level data
   */
  buildNavGraph() {
    const graph = {
      floors: {}
    };

    // Initialize each floor
    for (let i = 0; i < GAME.NUM_FLOORS; i++) {
      graph.floors[i] = {
        y: GAME.FLOORS[i],
        elevators: [],
        stairs: [],
        conveyors: []
      };
    }

    // Add elevators to floor data
    this.elevators.forEach(elevator => {
      // Elevators span all floors
      for (let floor = 0; floor < GAME.NUM_FLOORS; floor++) {
        graph.floors[floor].elevators.push({
          x: elevator.x,
          id: elevator.id
        });
      }
    });

    // Add stairs to floor data
    this.stairs.forEach(stair => {
      const upperFloor = stair.connectsAbove;
      const lowerFloor = stair.connectsBelow;

      if (graph.floors[upperFloor]) {
        graph.floors[upperFloor].stairs.push({
          x: stair.x,
          connectsTo: lowerFloor,
          direction: 'down'
        });
      }

      if (graph.floors[lowerFloor]) {
        graph.floors[lowerFloor].stairs.push({
          x: stair.x,
          connectsTo: upperFloor,
          direction: 'up'
        });
      }
    });

    // Add conveyors to floor data
    this.conveyors.forEach(conveyor => {
      if (graph.floors[conveyor.floor]) {
        graph.floors[conveyor.floor].conveyors.push({
          x: conveyor.x,
          length: conveyor.length,
          direction: conveyor.direction
        });
      }
    });

    return graph;
  }

  /**
   * Update all enemies
   */
  update(enemies, player, delta) {
    if (!player || !this.navGraph) {
      return;
    }

    enemies.forEach(enemy => {
      if (!enemy.state.isActive) {
        return;
      }

      // Update pathfind timer
      enemy.state.pathfindTimer += delta;

      // Recalculate path periodically
      if (enemy.state.pathfindTimer >= GAME.AI_REPATH_INTERVAL) {
        enemy.state.pathfindTimer = 0;
        this.calculatePath(enemy, player);
      }

      // Move along current path
      this.moveEnemy(enemy, player, delta);
    });
  }

  /**
   * Calculate path for an enemy to reach the player
   */
  calculatePath(enemy, player) {
    const enemyFloor = enemy.state.currentFloor;
    const playerFloor = player.state.currentFloor;

    // Check if on conveyor - must escape first
    if (this.isOnConveyor(enemy.x, enemyFloor)) {
      enemy.state.nextWaypoint = this.findNearestConveyorExit(enemy.x, enemyFloor);
      enemy.state.useElevator = false;
      enemy.state.useStairs = false;
      return;
    }

    if (enemyFloor === playerFloor) {
      // Same floor - move directly toward player
      enemy.state.nextWaypoint = { x: player.x, y: enemy.y };
      enemy.state.useElevator = false;
      enemy.state.useStairs = false;
    } else {
      // Different floor - find route
      const route = this.findRoute(enemy, enemyFloor, playerFloor);
      enemy.state.nextWaypoint = route.waypoint;
      enemy.state.useElevator = route.useElevator;
      enemy.state.useStairs = route.useStairs;
      enemy.state.targetFloor = playerFloor;
    }
  }

  /**
   * Find best route to change floors
   */
  findRoute(enemy, fromFloor, toFloor) {
    const floorData = this.navGraph.floors[fromFloor];
    if (!floorData) {
      return { waypoint: { x: enemy.x, y: enemy.y }, useElevator: false, useStairs: false };
    }

    // Find stairs that go in the right direction
    const goingUp = toFloor > fromFloor;
    const validStairs = floorData.stairs.filter(s =>
      goingUp ? s.direction === 'up' : s.direction === 'down'
    );

    // Get distances to all options
    const options = [];

    // Add elevator options
    floorData.elevators.forEach(e => {
      options.push({
        x: e.x,
        distance: Math.abs(enemy.x - e.x),
        useElevator: true,
        useStairs: false
      });
    });

    // Add stair options
    validStairs.forEach(s => {
      options.push({
        x: s.x,
        distance: Math.abs(enemy.x - s.x),
        useElevator: false,
        useStairs: true,
        stairData: s
      });
    });

    // Sort by distance
    options.sort((a, b) => a.distance - b.distance);

    // Return closest option
    if (options.length > 0) {
      const best = options[0];
      return {
        waypoint: { x: best.x, y: GAME.FLOORS[fromFloor] },
        useElevator: best.useElevator,
        useStairs: best.useStairs,
        stairData: best.stairData
      };
    }

    // No options - stay in place
    return { waypoint: { x: enemy.x, y: enemy.y }, useElevator: false, useStairs: false };
  }

  /**
   * Move enemy according to current path
   */
  moveEnemy(enemy, player, delta) {
    // Handle elevator movement
    if (enemy.state.isOnElevator) {
      this.handleElevatorMovement(enemy, player);
      return;
    }

    // Handle stair movement
    if (enemy.state.isOnStairs) {
      this.handleStairMovement(enemy, player);
      return;
    }

    // Normal floor movement
    const waypoint = enemy.state.nextWaypoint;
    if (!waypoint) {
      enemy.stop();
      return;
    }

    // Move toward waypoint
    const atWaypoint = enemy.moveTowardX(waypoint.x);

    if (atWaypoint) {
      // Reached waypoint - check if need to use elevator/stairs
      if (enemy.state.useElevator) {
        this.enterElevator(enemy);
      } else if (enemy.state.useStairs) {
        this.enterStairs(enemy);
      }
    }
  }

  /**
   * Handle enemy entering elevator
   */
  enterElevator(enemy) {
    const elevatorSystem = this.scene.elevatorSystem;
    if (!elevatorSystem) {
      return;
    }

    // Don't enter elevator if already on player's floor
    const player = this.scene.player;
    if (player && enemy.state.currentFloor === player.state.currentFloor) {
      enemy.state.useElevator = false;
      return;
    }

    // Find elevator by X position only (enemies can call elevator to their floor)
    const elevator = elevatorSystem.elevators.find(e =>
      Math.abs(e.x - enemy.x) < 20 && !e.rider
    );

    if (elevator) {
      // Move platform to enemy's floor before entering
      elevator.platform.y = enemy.y;
      elevatorSystem.enterElevator(enemy, elevator);
    }
  }

  /**
   * Handle enemy movement on elevator
   */
  handleElevatorMovement(enemy, player) {
    const elevatorSystem = this.scene.elevatorSystem;
    const elevator = enemy.currentElevator;

    if (!elevator || !elevatorSystem) {
      enemy.exitElevator();
      return;
    }

    const playerFloor = player.state.currentFloor;
    const currentY = enemy.y;
    const targetY = GAME.FLOORS[playerFloor];

    // Check if at target floor
    if (elevatorSystem.isAtFloor(currentY)) {
      const currentFloor = enemy.calculateFloor(currentY);

      if (currentFloor === playerFloor) {
        // At target floor - exit
        elevatorSystem.exitElevator(enemy, elevator);
        enemy.state.useElevator = false;
        return;
      }
    }

    // Move toward target floor
    const direction = targetY > currentY ? 1 : -1;
    elevatorSystem.startMoving(elevator, direction);
  }

  /**
   * Handle enemy entering stairs
   */
  enterStairs(enemy) {
    // Don't enter stairs if already on player's floor
    const player = this.scene.player;
    if (player && enemy.state.currentFloor === player.state.currentFloor) {
      enemy.state.useStairs = false;
      return;
    }

    // Find the stair at enemy's position
    const stair = this.stairs.find(s =>
      Math.abs(s.x - enemy.x) < 20 &&
      (s.connectsAbove === enemy.state.currentFloor || s.connectsBelow === enemy.state.currentFloor)
    );

    if (stair) {
      enemy.enterStairs(stair);
    }
  }

  /**
   * Handle enemy movement on stairs
   */
  handleStairMovement(enemy, player) {
    const stair = enemy.currentStair;
    if (!stair) {
      enemy.exitStairs();
      return;
    }

    const playerFloor = player.state.currentFloor;
    const enemyFloor = enemy.state.currentFloor;

    // Determine direction
    const goingUp = playerFloor > enemyFloor;
    const targetFloor = goingUp ? stair.connectsAbove : stair.connectsBelow;
    const targetY = GAME.FLOORS[targetFloor];

    // Move vertically on stairs (diagonal movement)
    const stairSpeedX = enemy.moveSpeed * 0.4;
    const stairSpeedY = enemy.moveSpeed * 0.7;

    // Calculate direction
    const dy = targetY - enemy.y;

    if (Math.abs(dy) > 6) {
      // Still on stairs
      enemy.setVelocityY(Math.sign(dy) * stairSpeedY);
      enemy.setVelocityX(goingUp ? stairSpeedX : -stairSpeedX);
      enemy.setFlipX(!goingUp);
    } else {
      // Reached floor - exit stairs
      enemy.y = targetY;
      enemy.exitStairs();
      enemy.state.useStairs = false;
      enemy.setVelocity(0, 0);
    }
  }

  /**
   * Check if position is on a conveyor belt
   */
  isOnConveyor(x, floor) {
    const floorData = this.navGraph?.floors[floor];
    if (!floorData?.conveyors) {
      return false;
    }

    return floorData.conveyors.some(c =>
      x >= c.x && x <= c.x + c.length
    );
  }

  /**
   * Find nearest exit from conveyor belt
   */
  findNearestConveyorExit(x, floor) {
    const floorData = this.navGraph?.floors[floor];
    if (!floorData?.conveyors) {
      return { x, y: GAME.FLOORS[floor] };
    }

    // Find which conveyor we're on
    for (const conveyor of floorData.conveyors) {
      if (x >= conveyor.x && x <= conveyor.x + conveyor.length) {
        // On this conveyor - find nearest exit
        const leftExit = conveyor.x - 10;
        const rightExit = conveyor.x + conveyor.length + 10;

        // Return nearest exit
        const distToLeft = Math.abs(x - leftExit);
        const distToRight = Math.abs(x - rightExit);

        return {
          x: distToLeft < distToRight ? leftExit : rightExit,
          y: GAME.FLOORS[floor]
        };
      }
    }

    return { x, y: GAME.FLOORS[floor] };
  }

  /**
   * Get floor number from Y position
   */
  getFloor(y) {
    let closestFloor = 0;
    let closestDistance = Infinity;

    for (const [floor, floorY] of Object.entries(GAME.FLOORS)) {
      const distance = Math.abs(y - floorY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestFloor = parseInt(floor);
      }
    }

    return closestFloor;
  }
}
