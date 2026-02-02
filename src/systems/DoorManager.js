import Phaser from 'phaser';
import { GAME } from '../constants/game.js';
import { C64_PALETTE } from '../constants/palette.js';

/**
 * Door state constants
 */
const DoorState = {
  CLOSED: 'closed',
  OPEN: 'open',
  OPENING: 'opening',
  CLOSING: 'closing'
};

/**
 * Item types that can be behind doors
 */
const ItemType = {
  PASS: 'pass',
  KEY: 'key',
  CAMERA: 'camera',
  BULB: 'bulb'
};

/**
 * DoorManager - Manages all doors, items, and Mr. Angry trigger
 *
 * Handles door creation, randomized item placement, door interactions,
 * item spawning, and the Mr. Angry awakening sequence.
 */
export class DoorManager {
  constructor(scene) {
    this.scene = scene;
    this.doors = [];
    this.items = null; // Physics group for spawned items
    this.mrAngryDoor = null;
    this.pollyDoor = null;
    this.mrAngryAwakened = false;
  }

  /**
   * Create all doors from tilemap data
   */
  createDoors(doorData) {
    // Create physics group for items
    this.items = this.scene.physics.add.group();

    doorData.forEach((data, index) => {
      const door = {
        id: index,
        x: data.x,
        y: data.y,
        floor: data.floor,
        state: DoorState.CLOSED,
        contents: null,
        hasBeenOpened: false,
        sprite: null
      };

      // Create door sprite
      // Door Y is at floor level, but sprite should be positioned above
      const doorY = data.y - 8; // Offset to align with floor
      door.sprite = this.scene.add.sprite(data.x, doorY, 'doors', 0);
      door.sprite.setOrigin(0.5, 1);
      door.sprite.setDepth(GAME.LAYER_DOORS);
      door.sprite.doorData = door;

      this.doors.push(door);
    });

    // Randomize what's behind each door
    this.randomizeContents();

    console.log(`Created ${this.doors.length} doors`);
  }

  /**
   * Randomly place items and Mr. Angry behind doors
   */
  randomizeContents() {
    // Reset all contents
    this.doors.forEach(door => {
      door.contents = null;
      door.hasBeenOpened = false;
    });

    // Polly is always behind the first door on the top floor (floor 3)
    // Find leftmost door on floor 3
    const floor3Doors = this.doors.filter(d => d.floor === 3);
    if (floor3Doors.length > 0) {
      floor3Doors.sort((a, b) => a.x - b.x);
      this.pollyDoor = floor3Doors[0];
      this.pollyDoor.contents = 'polly';
    }

    // Get doors that can have items or Mr. Angry (exclude Polly's door)
    const availableDoors = this.doors.filter(d => d !== this.pollyDoor);

    // Shuffle available doors
    const shuffled = Phaser.Utils.Array.Shuffle([...availableDoors]);

    // Place 4 items in first 4 shuffled doors
    const itemTypes = [ItemType.PASS, ItemType.KEY, ItemType.CAMERA, ItemType.BULB];
    for (let i = 0; i < 4 && i < shuffled.length; i++) {
      shuffled[i].contents = itemTypes[i];
    }

    // Place Mr. Angry in the next available door
    if (shuffled.length > 4) {
      this.mrAngryDoor = shuffled[4];
      this.mrAngryDoor.contents = 'mr_angry';
    }

    console.log('Door contents randomized');
    console.log('Polly door:', this.pollyDoor?.id);
    console.log('Mr. Angry door:', this.mrAngryDoor?.id);
  }

  /**
   * Update door manager each frame
   */
  update(delta) {
    // Nothing to update continuously for now
    // Items use physics, doors use animations
  }

  /**
   * Find a door near the given position
   */
  findNearbyDoor(x, y, threshold = 20) {
    return this.doors.find(door => {
      const distX = Math.abs(door.x - x);
      const distY = Math.abs(door.y - y);
      return distX < threshold && distY < 24; // Taller threshold for door height
    });
  }

  /**
   * Interact with a door (called when player presses action near a door)
   */
  interactWithDoor(player) {
    const door = this.findNearbyDoor(player.x, player.y);

    if (!door) {
      return false;
    }

    if (door.state === DoorState.CLOSED) {
      this.openDoor(door, player);
      return true;
    }

    return false;
  }

  /**
   * Open a door and handle its contents
   */
  openDoor(door, player) {
    if (door.state !== DoorState.CLOSED) {
      return;
    }

    door.state = DoorState.OPENING;

    // Play open animation
    door.sprite.play('door_open');

    // When animation completes, handle contents
    door.sprite.once('animationcomplete', () => {
      door.state = DoorState.OPEN;
      door.hasBeenOpened = true;

      // Handle what's behind the door
      if (door.contents && door.contents !== 'polly') {
        this.handleDoorContents(door, player);
      }
    });
  }

  /**
   * Handle the contents when a door is opened
   */
  handleDoorContents(door, player) {
    const contents = door.contents;

    if (contents === 'mr_angry') {
      this.awakenMrAngry(door);
    } else if (contents === 'polly') {
      // Polly handled separately in win condition
    } else if (contents) {
      // It's an item
      this.spawnItem(door, contents);
    }

    // Clear contents so item doesn't spawn again
    door.contents = null;
  }

  /**
   * Spawn an item in front of a door
   */
  spawnItem(door, itemType) {
    // Get frame index for item type
    const frameMap = {
      [ItemType.PASS]: 0,
      [ItemType.KEY]: 1,
      [ItemType.CAMERA]: 2,
      [ItemType.BULB]: 3
    };

    const frame = frameMap[itemType] ?? 0;

    // Spawn item in front of door
    const itemX = door.x;
    const itemY = door.y - 8; // Slightly above floor level

    const item = this.scene.physics.add.sprite(itemX, itemY, 'items', frame);
    item.setDepth(GAME.LAYER_ITEMS);
    item.itemType = itemType;
    item.body.setAllowGravity(false);

    // Add to items group
    this.items.add(item);

    // Small bounce animation
    this.scene.tweens.add({
      targets: item,
      y: itemY - 8,
      duration: 200,
      ease: 'Quad.easeOut',
      yoyo: true
    });

    console.log(`Spawned item: ${itemType} at door ${door.id}`);
  }

  /**
   * Awaken Mr. Angry when his door is opened
   */
  awakenMrAngry(door) {
    if (this.mrAngryAwakened) {
      return;
    }

    this.mrAngryAwakened = true;

    // Screen flash effect
    this.scene.cameras.main.flash(300, 104, 55, 43, true); // Red flash

    // Screen shake
    this.scene.cameras.main.shake(300, 0.02);

    // Spawn Mr. Angry at door position
    const mrAngryX = door.x;
    const mrAngryY = door.y;

    // Emit event for GameScene to create Mr. Angry enemy
    this.scene.events.emit('mrAngryAwakened', { x: mrAngryX, y: mrAngryY });

    console.log('Mr. Angry awakened!');
  }

  /**
   * Check if Polly's door is open (for win condition)
   */
  isPollyDoorOpen() {
    return this.pollyDoor && this.pollyDoor.state === DoorState.OPEN;
  }

  /**
   * Get all spawned items for collision detection
   */
  getItems() {
    return this.items;
  }

  /**
   * Collect an item (remove from game)
   */
  collectItem(item) {
    const itemType = item.itemType;

    // Visual effect - item flies up and fades
    this.scene.tweens.add({
      targets: item,
      y: item.y - 20,
      alpha: 0,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => {
        item.destroy();
      }
    });

    return itemType;
  }

  /**
   * Reset doors for new game
   */
  reset() {
    this.mrAngryAwakened = false;

    // Clear spawned items
    if (this.items) {
      this.items.clear(true, true);
    }

    // Reset all doors to closed
    this.doors.forEach(door => {
      door.state = DoorState.CLOSED;
      door.hasBeenOpened = false;
      door.sprite.setFrame(0);
    });

    // Re-randomize contents
    this.randomizeContents();
  }
}
