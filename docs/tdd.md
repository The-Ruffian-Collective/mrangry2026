# Technical Design Document: Mr. Angry 2026 Recreation

## Overview

This document details the technical architecture, data structures, algorithms, and implementation patterns for building a web-based spiritual successor to the C64 game "Mr. Angry" using Phaser 3.

---

## 1. Technology Stack

### Core Framework
```
Phaser 3.60+
├── Renderer: WebGL (Canvas fallback)
├── Physics: Arcade Physics
├── Input: Keyboard + Touch + Gamepad
└── Audio: Web Audio API
```

### Supporting Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| Phaser | 3.60+ | Game framework |
| ZzFX | 1.0.0 | Procedural audio |
| (Optional) Vite | 5.0+ | Dev server & bundling |

### No External Dependencies For
- Sprite sheets (created as PNG)
- Tilemaps (JSON format, Tiled editor)
- Fonts (bitmap font PNG)

---

## 2. Phaser Configuration

### Game Config Object

```javascript
// src/config.js
export const CONFIG = {
  type: Phaser.AUTO,
  width: 320,
  height: 200,
  parent: 'game-container',
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: 3,
    min: { width: 320, height: 200 },
    max: { width: 1280, height: 800 }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
      tileBias: 8
    }
  },
  input: {
    activePointers: 2
  },
  audio: {
    disableWebAudio: false
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene]
};
```

### C64 Palette Constants

```javascript
// src/constants/palette.js
export const C64_PALETTE = {
  BLACK: 0x000000,
  WHITE: 0xFFFFFF,
  RED: 0x68372B,
  CYAN: 0x70A4B2,
  PURPLE: 0x6F3D86,
  GREEN: 0x588D43,
  BLUE: 0x352879,
  YELLOW: 0xB8C76F,
  ORANGE: 0x6F4F25,
  BROWN: 0x433900,
  LIGHT_RED: 0x9A6759,
  DARK_GRAY: 0x444444,
  MEDIUM_GRAY: 0x6C6C6C,
  LIGHT_GREEN: 0x9AD284,
  LIGHT_BLUE: 0x6C5EB5,
  LIGHT_GRAY: 0x959595
};

// CSS hex versions for HTML/CSS use
export const C64_PALETTE_HEX = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  RED: '#68372B',
  CYAN: '#70A4B2',
  PURPLE: '#6F3D86',
  GREEN: '#588D43',
  BLUE: '#352879',
  YELLOW: '#B8C76F',
  ORANGE: '#6F4F25',
  BROWN: '#433900',
  LIGHT_RED: '#9A6759',
  DARK_GRAY: '#444444',
  MEDIUM_GRAY: '#6C6C6C',
  LIGHT_GREEN: '#9AD284',
  LIGHT_BLUE: '#6C5EB5',
  LIGHT_GRAY: '#959595'
};
```

### Game Constants

```javascript
// src/constants/game.js
export const GAME = {
  // Display
  WIDTH: 320,
  HEIGHT: 200,
  TILE_SIZE: 16,
  
  // Physics
  PLAYER_SPEED: 80,
  ENEMY_SPEED: 60,
  MR_ANGRY_SPEED: 90,
  ELEVATOR_SPEED: 40,
  CONVEYOR_SPEED: 30,
  
  // Gameplay
  STARTING_LIVES: 3,
  LEVEL_TIME: 120, // seconds
  WARNING_TIME: 30, // seconds remaining
  
  // AI
  AI_REPATH_INTERVAL: 500, // ms
  
  // Scoring
  SCORE_PASS: 100,
  SCORE_KEY: 150,
  SCORE_CAMERA: 200,
  SCORE_BULB: 150,
  SCORE_PHOTOGRAPH: 500,
  SCORE_TIME_BONUS: 10, // per second remaining
  
  // Layers
  LAYER_BACKGROUND: 0,
  LAYER_TILES: 1,
  LAYER_ITEMS: 2,
  LAYER_ENEMIES: 3,
  LAYER_PLAYER: 4,
  LAYER_DOORS: 5,
  LAYER_HUD: 6
};
```

---

## 3. Data Structures

### Player State

```javascript
// src/entities/Player.js
class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    
    this.state = {
      lives: GAME.STARTING_LIVES,
      inventory: {
        pass: false,
        key: false,
        camera: false,
        bulb: false
      },
      isDead: false,
      isOnElevator: false,
      isOnStairs: false,
      currentFloor: 0,
      facingDirection: 'right'
    };
    
    this.score = 0;
  }
  
  hasAllItems() {
    const inv = this.state.inventory;
    return inv.pass && inv.key && inv.camera && inv.bulb;
  }
  
  collectItem(itemType) {
    this.state.inventory[itemType] = true;
    this.score += GAME[`SCORE_${itemType.toUpperCase()}`];
  }
}
```

### Enemy State

```javascript
// src/entities/Enemy.js
class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, 'enemies', type);
    
    this.enemyType = type; // 'inspector', 'manager', 'patron', 'mr_angry'
    this.state = {
      isActive: true,
      isChasing: true,
      currentFloor: 0,
      targetPosition: null,
      pathfindTimer: 0
    };
    
    this.speed = type === 'mr_angry' ? GAME.MR_ANGRY_SPEED : GAME.ENEMY_SPEED;
  }
}
```

### Door State

```javascript
// src/systems/DoorManager.js
const DoorState = {
  CLOSED: 'closed',
  OPEN: 'open',
  OPENING: 'opening',
  CLOSING: 'closing'
};

class Door {
  constructor(id, x, y, floor) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.floor = floor;
    this.state = DoorState.CLOSED;
    this.contents = null; // 'pass', 'key', 'camera', 'bulb', 'mr_angry', 'polly', null
    this.hasBeenOpened = false;
  }
}
```

### Level Data Structure

```javascript
// Tilemap JSON structure (Tiled editor export)
{
  "width": 20,
  "height": 12,
  "tilewidth": 16,
  "tileheight": 16,
  "layers": [
    {
      "name": "background",
      "type": "tilelayer",
      "data": [/* tile indices */]
    },
    {
      "name": "collision",
      "type": "tilelayer",
      "data": [/* collision tile indices */]
    },
    {
      "name": "objects",
      "type": "objectgroup",
      "objects": [
        { "name": "player_spawn", "x": 32, "y": 176 },
        { "name": "door", "x": 64, "y": 160, "properties": { "floor": 0 } },
        { "name": "elevator", "x": 288, "y": 0, "properties": { "id": 1 } },
        { "name": "enemy_spawn", "x": 160, "y": 48, "properties": { "type": "inspector" } }
      ]
    }
  ],
  "tilesets": [
    {
      "name": "tileset",
      "image": "tileset.png",
      "tilewidth": 16,
      "tileheight": 16
    }
  ]
}
```

---

## 4. Scene Architecture

### Scene Flow

```
BootScene
    │
    ▼ (assets loaded)
MenuScene
    │
    ▼ (player starts game)
GameScene ◄─────┐
    │           │
    ▼ (death)   │ (retry)
GameOverScene ──┘
```

### BootScene

```javascript
// src/scenes/BootScene.js
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }
  
  preload() {
    // Loading bar
    this.createLoadingBar();
    
    // Sprites
    this.load.spritesheet('player', 'assets/sprites/player.png', {
      frameWidth: 24, frameHeight: 21
    });
    this.load.spritesheet('enemies', 'assets/sprites/enemies.png', {
      frameWidth: 24, frameHeight: 21
    });
    this.load.spritesheet('items', 'assets/sprites/items.png', {
      frameWidth: 16, frameHeight: 16
    });
    this.load.spritesheet('doors', 'assets/sprites/doors.png', {
      frameWidth: 16, frameHeight: 32
    });
    
    // Tilemap
    this.load.image('tileset', 'assets/sprites/tileset.png');
    this.load.tilemapTiledJSON('level1', 'assets/tilemaps/level1.json');
    
    // Font
    this.load.bitmapFont('c64', 'assets/fonts/c64-font.png', 'assets/fonts/c64-font.xml');
  }
  
  create() {
    // Define animations
    this.createAnimations();
    this.scene.start('MenuScene');
  }
  
  createAnimations() {
    // Player walk
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
    
    // Enemy walk (per type)
    ['inspector', 'manager', 'patron', 'mr_angry'].forEach((type, index) => {
      this.anims.create({
        key: `${type}_walk`,
        frames: this.anims.generateFrameNumbers('enemies', { 
          start: index * 4, 
          end: index * 4 + 3 
        }),
        frameRate: 6,
        repeat: -1
      });
    });
  }
}
```

### GameScene Core Structure

```javascript
// src/scenes/GameScene.js
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }
  
  create() {
    // Systems
    this.doorManager = new DoorManager(this);
    this.enemyAI = new EnemyAI(this);
    this.timerSystem = new TimerSystem(this, GAME.LEVEL_TIME);
    this.soundManager = new SoundManager(this);
    
    // Level
    this.createLevel();
    
    // Entities
    this.createPlayer();
    this.createEnemies();
    this.doorManager.createDoors();
    this.doorManager.randomizeContents();
    
    // UI
    this.hud = new HUD(this);
    this.touchControls = new TouchControls(this);
    
    // Input
    this.setupInput();
    
    // Collisions
    this.setupCollisions();
    
    // Start timer
    this.timerSystem.start();
  }
  
  update(time, delta) {
    if (this.isPaused || this.player.state.isDead) return;
    
    this.handlePlayerInput();
    this.enemyAI.update(time, delta);
    this.timerSystem.update(delta);
    this.hud.update();
  }
}
```

---

## 5. Enemy AI System

### Pathfinding Approach

For a single-screen game with simple topology (floors connected by elevators/stairs), we use **waypoint-based navigation** rather than full A* pathfinding.

```javascript
// src/systems/EnemyAI.js
class EnemyAI {
  constructor(scene) {
    this.scene = scene;
    this.navGraph = this.buildNavGraph();
  }
  
  buildNavGraph() {
    // Build a graph of navigable connections
    return {
      floors: [
        { y: 176, elevators: [288, 32], stairs: [{ x: 160, connects: 1 }] },
        { y: 128, elevators: [288, 32], stairs: [{ x: 160, connects: 0 }, { x: 200, connects: 2 }] },
        { y: 80, elevators: [288, 32], stairs: [{ x: 200, connects: 1 }, { x: 240, connects: 3 }] },
        { y: 32, elevators: [288, 32], stairs: [{ x: 240, connects: 2 }], conveyors: [{ x: 100, length: 80 }] }
      ]
    };
  }
  
  update(time, delta) {
    this.scene.enemies.getChildren().forEach(enemy => {
      if (!enemy.state.isActive) return;
      
      enemy.state.pathfindTimer += delta;
      
      if (enemy.state.pathfindTimer >= GAME.AI_REPATH_INTERVAL) {
        enemy.state.pathfindTimer = 0;
        this.calculatePath(enemy);
      }
      
      this.moveAlongPath(enemy);
    });
  }
  
  calculatePath(enemy) {
    const player = this.scene.player;
    const enemyFloor = this.getFloor(enemy.y);
    const playerFloor = this.getFloor(player.y);
    
    if (enemyFloor === playerFloor) {
      // Same floor: move directly toward player
      enemy.state.targetPosition = { x: player.x, y: enemy.y };
    } else {
      // Different floor: find nearest elevator or stairs
      const route = this.findVerticalRoute(enemy, enemyFloor, playerFloor);
      enemy.state.targetPosition = route.nextWaypoint;
      enemy.state.useElevator = route.useElevator;
    }
  }
  
  findVerticalRoute(enemy, fromFloor, toFloor) {
    const floor = this.navGraph.floors[fromFloor];
    
    // Check if on conveyor (enemies can't use conveyors)
    if (this.isOnConveyor(enemy.x, fromFloor)) {
      return { nextWaypoint: this.findNearestNonConveyor(enemy.x, fromFloor), useElevator: false };
    }
    
    // Find nearest elevator
    const nearestElevator = this.findNearest(enemy.x, floor.elevators);
    
    // Find nearest stairs going correct direction
    const validStairs = floor.stairs.filter(s => 
      (toFloor > fromFloor && s.connects > fromFloor) ||
      (toFloor < fromFloor && s.connects < fromFloor)
    );
    const nearestStairs = validStairs.length > 0 
      ? this.findNearest(enemy.x, validStairs.map(s => s.x))
      : Infinity;
    
    // Choose closest option
    const distToElevator = Math.abs(enemy.x - nearestElevator);
    const distToStairs = nearestStairs !== Infinity 
      ? Math.abs(enemy.x - nearestStairs) 
      : Infinity;
    
    if (distToElevator < distToStairs) {
      return { nextWaypoint: { x: nearestElevator, y: enemy.y }, useElevator: true };
    } else {
      return { nextWaypoint: { x: nearestStairs, y: enemy.y }, useElevator: false };
    }
  }
  
  moveAlongPath(enemy) {
    const target = enemy.state.targetPosition;
    if (!target) return;
    
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    
    // Horizontal movement
    if (Math.abs(dx) > 2) {
      enemy.setVelocityX(Math.sign(dx) * enemy.speed);
      enemy.setFlipX(dx < 0);
    } else {
      enemy.setVelocityX(0);
      
      // At horizontal target, handle vertical movement
      if (enemy.state.useElevator && this.isAtElevator(enemy)) {
        this.useElevator(enemy);
      } else if (this.isAtStairs(enemy)) {
        this.useStairs(enemy);
      }
    }
  }
  
  isOnConveyor(x, floor) {
    const floorData = this.navGraph.floors[floor];
    if (!floorData.conveyors) return false;
    return floorData.conveyors.some(c => x >= c.x && x <= c.x + c.length);
  }
  
  getFloor(y) {
    // Convert y position to floor index
    return Math.floor((this.scene.game.config.height - y) / 48);
  }
  
  findNearest(x, positions) {
    return positions.reduce((nearest, pos) => 
      Math.abs(pos - x) < Math.abs(nearest - x) ? pos : nearest
    , positions[0]);
  }
}
```

---

## 6. Door System

```javascript
// src/systems/DoorManager.js
class DoorManager {
  constructor(scene) {
    this.scene = scene;
    this.doors = [];
    this.doorSprites = scene.add.group();
  }
  
  createDoors() {
    // Get door positions from tilemap objects layer
    const doorObjects = this.scene.map.getObjectLayer('objects')
      .objects.filter(obj => obj.name === 'door');
    
    doorObjects.forEach((obj, index) => {
      const door = new Door(index, obj.x, obj.y, obj.properties?.floor || 0);
      this.doors.push(door);
      
      const sprite = this.scene.physics.add.sprite(obj.x, obj.y, 'doors', 0);
      sprite.doorData = door;
      sprite.setImmovable(true);
      this.doorSprites.add(sprite);
    });
  }
  
  randomizeContents() {
    // Reset all doors
    this.doors.forEach(door => {
      door.contents = null;
      door.hasBeenOpened = false;
    });
    
    // Place required items
    const items = ['pass', 'key', 'camera', 'bulb'];
    const availableDoors = this.doors.filter(d => !d.isGoalDoor && !d.isMrAngryDoor);
    
    // Shuffle and assign items
    const shuffledDoors = Phaser.Utils.Array.Shuffle([...availableDoors]);
    items.forEach((item, i) => {
      if (shuffledDoors[i]) {
        shuffledDoors[i].contents = item;
      }
    });
    
    // Place Mr. Angry behind random remaining door
    const emptyDoors = shuffledDoors.filter(d => !d.contents);
    if (emptyDoors.length > 0) {
      const angryDoor = Phaser.Utils.Array.GetRandom(emptyDoors);
      angryDoor.contents = 'mr_angry';
      angryDoor.isMrAngryDoor = true;
    }
    
    // Mark goal door (fixed position - leftmost on top floor)
    const goalDoor = this.doors.find(d => d.floor === 3 && d.x === this.getLeftmostX(3));
    if (goalDoor) {
      goalDoor.contents = 'polly';
      goalDoor.isGoalDoor = true;
    }
  }
  
  interactWithDoor(player) {
    const nearbyDoor = this.findNearbyDoor(player.x, player.y);
    if (!nearbyDoor) return;
    
    const sprite = this.doorSprites.getChildren()
      .find(s => s.doorData === nearbyDoor);
    
    if (nearbyDoor.state === DoorState.CLOSED) {
      this.openDoor(nearbyDoor, sprite, player);
    } else if (nearbyDoor.state === DoorState.OPEN) {
      this.closeDoor(nearbyDoor, sprite);
    }
  }
  
  openDoor(door, sprite, player) {
    door.state = DoorState.OPENING;
    
    // Play animation
    sprite.play('door_open');
    this.scene.soundManager.play('door_open');
    
    sprite.once('animationcomplete', () => {
      door.state = DoorState.OPEN;
      door.hasBeenOpened = true;
      
      // Handle contents
      if (door.contents === 'mr_angry' && !this.mrAngryAwoken) {
        this.awakenMrAngry(door);
      } else if (['pass', 'key', 'camera', 'bulb'].includes(door.contents)) {
        this.spawnItem(door);
      } else if (door.contents === 'polly' && player.hasAllItems()) {
        this.revealPolly(door);
      }
    });
  }
  
  awakenMrAngry(door) {
    this.mrAngryAwoken = true;
    this.scene.soundManager.play('mr_angry_wake');
    
    // Spawn Mr. Angry at door position
    const mrAngry = new Enemy(this.scene, door.x, door.y, 'mr_angry');
    mrAngry.state.isActive = true;
    this.scene.enemies.add(mrAngry);
    
    // Flash effect
    this.scene.cameras.main.flash(200, 255, 0, 0);
  }
  
  spawnItem(door) {
    const item = this.scene.physics.add.sprite(door.x, door.y + 8, 'items', 
      this.getItemFrame(door.contents));
    item.itemType = door.contents;
    this.scene.items.add(item);
    door.contents = null; // Item removed from door
  }
  
  findNearbyDoor(x, y) {
    const threshold = 20;
    return this.doors.find(door => 
      Math.abs(door.x - x) < threshold && 
      Math.abs(door.y - y) < threshold
    );
  }
  
  getItemFrame(itemType) {
    const frames = { pass: 0, key: 1, camera: 2, bulb: 3 };
    return frames[itemType] || 0;
  }
}
```

---

## 7. Elevator System

```javascript
// src/systems/ElevatorSystem.js
class ElevatorSystem {
  constructor(scene) {
    this.scene = scene;
    this.elevators = [];
  }
  
  createElevators() {
    const elevatorObjects = this.scene.map.getObjectLayer('objects')
      .objects.filter(obj => obj.name === 'elevator');
    
    elevatorObjects.forEach(obj => {
      const elevator = {
        id: obj.properties?.id || 0,
        x: obj.x,
        minY: 32,  // Top floor
        maxY: 176, // Bottom floor
        platform: null,
        rider: null,
        isMoving: false,
        direction: 0
      };
      
      // Create platform sprite
      elevator.platform = this.scene.physics.add.sprite(obj.x, obj.y, 'tileset', 24);
      elevator.platform.setImmovable(true);
      elevator.platform.elevatorData = elevator;
      
      this.elevators.push(elevator);
    });
  }
  
  update(delta) {
    this.elevators.forEach(elevator => {
      if (elevator.isMoving && elevator.rider) {
        this.moveElevator(elevator, delta);
      }
    });
  }
  
  enterElevator(entity, elevator) {
    if (elevator.rider) return false; // Already occupied
    
    elevator.rider = entity;
    entity.state.isOnElevator = true;
    entity.x = elevator.x;
    
    return true;
  }
  
  exitElevator(entity, elevator) {
    elevator.rider = null;
    elevator.isMoving = false;
    elevator.direction = 0;
    entity.state.isOnElevator = false;
  }
  
  startMoving(elevator, direction) {
    if (!elevator.rider) return;
    elevator.isMoving = true;
    elevator.direction = direction; // -1 = up, 1 = down
  }
  
  moveElevator(elevator, delta) {
    const speed = GAME.ELEVATOR_SPEED * (delta / 1000);
    const newY = elevator.platform.y + (elevator.direction * speed * 60);
    
    // Clamp to bounds
    const clampedY = Phaser.Math.Clamp(newY, elevator.minY, elevator.maxY);
    
    // Check if at floor
    if (this.isAtFloor(clampedY)) {
      elevator.platform.y = this.snapToFloor(clampedY);
      elevator.rider.y = elevator.platform.y;
      // Don't auto-stop, let player/AI decide to exit
    } else {
      elevator.platform.y = clampedY;
      elevator.rider.y = clampedY;
    }
    
    // Stop at bounds
    if (clampedY === elevator.minY || clampedY === elevator.maxY) {
      elevator.isMoving = false;
      elevator.direction = 0;
    }
  }
  
  isAtFloor(y) {
    const floors = [32, 80, 128, 176];
    return floors.some(floor => Math.abs(y - floor) < 4);
  }
  
  snapToFloor(y) {
    const floors = [32, 80, 128, 176];
    return floors.reduce((nearest, floor) => 
      Math.abs(floor - y) < Math.abs(nearest - y) ? floor : nearest
    , floors[0]);
  }
  
  getNearbyElevator(x, y) {
    return this.elevators.find(e => 
      Math.abs(e.x - x) < 16 && 
      Math.abs(e.platform.y - y) < 16
    );
  }
}
```

---

## 8. Audio System (ZzFX)

```javascript
// src/audio/SoundManager.js
import { zzfx } from './zzfx.js';

class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.muted = false;
    
    // Pre-defined sound parameters
    this.sounds = {
      door_open: [.3,,80,.02,.08,.12,1,0.5,,,,,,,,.1],
      door_close: [.3,,60,.01,.05,.1,1,0.3,,,,,,,,.05],
      item_pickup: [.5,,200,.01,.05,.15,1,2,,,,,.1,1],
      death: [.8,,100,.02,.3,.4,4,3,,-5,,,.1,,,,.2,.5],
      mr_angry_wake: [1,,150,.05,.2,.3,3,4,,,-100,.05,.1,,,,.3,.4,.1],
      photograph: [.6,,800,.01,.02,.03,1,0,,100,,,.05],
      timer_warning: [.3,,400,.01,.01,.01,2,0,,,,,,3],
      level_complete: [.5,,300,.02,.15,.3,1,1,,,,,.05,,,,.1,.6,.05,.1]
    };
  }
  
  play(soundName) {
    if (this.muted) return;
    
    const params = this.sounds[soundName];
    if (params) {
      zzfx(...params);
    }
  }
  
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

// Minimal ZzFX implementation (inline or separate file)
// https://github.com/KilledByAPixel/ZzFX
export function zzfx(...parameters) {
  // ZzFX library code here
  // ~1KB minified
}
```

---

## 9. Input Handling

```javascript
// src/scenes/GameScene.js (partial)
setupInput() {
  // Keyboard
  this.cursors = this.input.keyboard.createCursorKeys();
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  this.actionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
  this.muteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
  
  // Pause handler
  this.pauseKey.on('down', () => this.togglePause());
  this.muteKey.on('down', () => this.soundManager.toggleMute());
  
  // Action handler
  this.actionKey.on('down', () => this.handleAction());
}

handlePlayerInput() {
  const player = this.player;
  const left = this.cursors.left.isDown || this.wasd.left.isDown || this.touchControls.left;
  const right = this.cursors.right.isDown || this.wasd.right.isDown || this.touchControls.right;
  const up = this.cursors.up.isDown || this.wasd.up.isDown || this.touchControls.up;
  const down = this.cursors.down.isDown || this.wasd.down.isDown || this.touchControls.down;
  
  // Reset velocity
  player.setVelocity(0);
  
  if (player.state.isOnElevator) {
    // Elevator controls
    const elevator = this.elevatorSystem.getNearbyElevator(player.x, player.y);
    if (up) this.elevatorSystem.startMoving(elevator, -1);
    else if (down) this.elevatorSystem.startMoving(elevator, 1);
    else if (left || right) this.elevatorSystem.exitElevator(player, elevator);
  } else if (player.state.isOnStairs) {
    // Stair controls
    if (up) player.setVelocityY(-GAME.PLAYER_SPEED * 0.7);
    else if (down) player.setVelocityY(GAME.PLAYER_SPEED * 0.7);
  } else {
    // Normal movement
    if (left) {
      player.setVelocityX(-GAME.PLAYER_SPEED);
      player.setFlipX(true);
      player.anims.play('player_walk', true);
    } else if (right) {
      player.setVelocityX(GAME.PLAYER_SPEED);
      player.setFlipX(false);
      player.anims.play('player_walk', true);
    } else {
      player.anims.play('player_idle', true);
    }
    
    // Check for elevator/stair entry
    if (up || down) {
      const elevator = this.elevatorSystem.getNearbyElevator(player.x, player.y);
      if (elevator) {
        this.elevatorSystem.enterElevator(player, elevator);
        if (up) this.elevatorSystem.startMoving(elevator, -1);
        else this.elevatorSystem.startMoving(elevator, 1);
      }
    }
  }
  
  // Conveyor effect
  if (this.isOnConveyor(player.x, player.y)) {
    const conveyorSpeed = this.getConveyorDirection(player.x, player.y) * GAME.CONVEYOR_SPEED;
    player.x += conveyorSpeed * (this.game.loop.delta / 1000);
  }
}

handleAction() {
  // Check for door interaction
  this.doorManager.interactWithDoor(this.player);
  
  // Check for photograph (at Polly's door with all items)
  if (this.canTakePhotograph()) {
    this.takePhotograph();
  }
}
```

---

## 10. Collision Setup

```javascript
// src/scenes/GameScene.js (partial)
setupCollisions() {
  // Player vs collision layer
  this.physics.add.collider(this.player, this.collisionLayer);
  
  // Player vs enemies (death)
  this.physics.add.overlap(
    this.player, 
    this.enemies, 
    this.handlePlayerEnemyCollision, 
    null, 
    this
  );
  
  // Player vs items (collection)
  this.physics.add.overlap(
    this.player,
    this.items,
    this.handleItemCollection,
    null,
    this
  );
  
  // Enemies vs collision layer
  this.physics.add.collider(this.enemies, this.collisionLayer);
}

handlePlayerEnemyCollision(player, enemy) {
  if (player.state.isDead) return;
  
  this.playerDeath();
}

handleItemCollection(player, item) {
  const itemType = item.itemType;
  player.collectItem(itemType);
  
  this.soundManager.play('item_pickup');
  item.destroy();
  
  this.hud.updateInventory();
}

playerDeath() {
  this.player.state.isDead = true;
  this.player.state.lives--;
  
  this.soundManager.play('death');
  
  // Death animation
  this.tweens.add({
    targets: this.player,
    alpha: 0,
    duration: 100,
    yoyo: true,
    repeat: 5,
    onComplete: () => {
      if (this.player.state.lives <= 0) {
        this.scene.start('GameOverScene', { score: this.player.score });
      } else {
        this.resetLevel();
      }
    }
  });
}

resetLevel() {
  // Reset player position
  this.player.setPosition(this.playerSpawn.x, this.playerSpawn.y);
  this.player.state.isDead = false;
  
  // Reset enemies to starting positions
  this.enemies.getChildren().forEach(enemy => {
    const spawn = this.enemySpawns.find(s => s.type === enemy.enemyType);
    if (spawn) {
      enemy.setPosition(spawn.x, spawn.y);
    }
  });
  
  // Reset timer
  this.timerSystem.reset();
  
  // Update HUD
  this.hud.updateLives();
}
```

---

## 11. Sprite Sheet Specifications

### Player Sprite Sheet (player.png)
```
Layout: 8 frames horizontal
Frame size: 24×21 pixels
Frames 0-3: Walk cycle (right-facing)
Frames 4-5: Climb/stairs animation
Frames 6-7: Death animation
```

### Enemies Sprite Sheet (enemies.png)
```
Layout: 16 frames (4 rows × 4 columns)
Frame size: 24×21 pixels
Row 0 (frames 0-3): Hotel Inspector walk
Row 1 (frames 4-7): Hotel Manager walk
Row 2 (frames 8-11): Bar Patron walk
Row 3 (frames 12-15): Mr. Angry walk
```

### Items Sprite Sheet (items.png)
```
Layout: 4 frames horizontal
Frame size: 16×16 pixels
Frame 0: Pass (ID card)
Frame 1: Key
Frame 2: Camera
Frame 3: Lightbulb/Flash
```

### Doors Sprite Sheet (doors.png)
```
Layout: 4 frames horizontal
Frame size: 16×32 pixels
Frame 0: Door closed
Frame 1-2: Door opening (animation frames)
Frame 3: Door open
```

### Tileset (tileset.png)
```
Layout: 8×8 grid (64 tiles)
Tile size: 16×16 pixels (or 8×8 for detailed tiles)

Suggested tile indices:
0: Empty/transparent
1: Floor
2: Wall top
3: Wall middle
4: Wall bottom
5: Elevator shaft background
6-7: Elevator platform frames
8-9: Stairs (up-left, up-right)
10-13: Conveyor belt animation frames
14: Door frame left
15: Door frame right
16-31: Decorative tiles (windows, signs, etc.)
```

---

## 12. Build & Development Setup

### package.json

```json
{
  "name": "mr-angry-2026",
  "version": "1.0.0",
  "description": "Web-based spiritual successor to C64 Mr. Angry",
  "main": "src/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "phaser": "^3.60.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "eslint": "^8.50.0",
    "typescript": "^5.2.0"
  }
}
```

### vite.config.js

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
```

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Mr. Angry</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      width: 100%; 
      height: 100%; 
      background: #000; 
      overflow: hidden;
    }
    #game-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    canvas { 
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

---

## 13. Testing Considerations

### Manual Test Cases
1. **Movement:** Player moves in all 4 directions without passing through walls
2. **Elevators:** Player can enter, ride, and exit elevators on all floors
3. **Stairs:** Player can ascend/descend stairs; falling triggers death
4. **Doors:** All doors open/close; contents appear correctly
5. **Items:** All 4 items collectable; inventory updates
6. **Enemies:** Enemies pursue player; use elevators/stairs; avoid conveyors
7. **Mr. Angry:** Triggers on door open; pursues aggressively
8. **Win Condition:** Photographing Polly with all items triggers victory
9. **Death:** Enemy contact and falling trigger death; lives decrement
10. **Timer:** Countdown works; expiration costs life
11. **Audio:** All sound effects play at correct moments
12. **Mobile:** Touch controls functional on mobile devices

### Performance Benchmarks
- Target: 60fps on Chrome 90+ desktop
- Target: 30fps minimum on mobile Safari
- Load time: <3 seconds on 3G connection
