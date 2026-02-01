/**
 * Generate placeholder sprite sheets for Mr. Angry 2026
 * Run with: node scripts/generate-placeholders.js
 */

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// C64 Pepto Palette
const PALETTE = {
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

function savePNG(canvas, filepath) {
  const buffer = canvas.toBuffer('image/png');
  writeFileSync(filepath, buffer);
  console.log(`Created: ${filepath}`);
}

/**
 * Player sprite sheet: 24x21 pixels, 8 frames horizontal
 * Frames 0-3: Walk cycle, Frames 4-5: Climb, Frames 6-7: Death
 */
function createPlayerSprite() {
  const frameWidth = 24;
  const frameHeight = 21;
  const frames = 8;

  const canvas = createCanvas(frameWidth * frames, frameHeight);
  const ctx = canvas.getContext('2d');

  // Transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < frames; i++) {
    const x = i * frameWidth;

    // Body (cyan - player color)
    ctx.fillStyle = PALETTE.CYAN;
    ctx.fillRect(x + 6, 6, 12, 12);

    // Head
    ctx.fillStyle = PALETTE.LIGHT_GRAY;
    ctx.fillRect(x + 8, 2, 8, 6);

    // Legs (animate for walk frames)
    ctx.fillStyle = PALETTE.BLUE;
    if (i < 4) {
      // Walk animation - alternate leg positions
      const legOffset = (i % 2) * 2;
      ctx.fillRect(x + 7 + legOffset, 18, 4, 3);
      ctx.fillRect(x + 13 - legOffset, 18, 4, 3);
    } else if (i < 6) {
      // Climb animation
      ctx.fillRect(x + 8, 18, 8, 3);
    } else {
      // Death frames
      ctx.fillStyle = PALETTE.RED;
      ctx.fillRect(x + 6, 10, 12, 8);
    }

    // Camera (held item indicator)
    if (i < 6) {
      ctx.fillStyle = PALETTE.DARK_GRAY;
      ctx.fillRect(x + 18, 8, 4, 4);
    }
  }

  savePNG(canvas, 'assets/sprites/player.png');
}

/**
 * Enemies sprite sheet: 24x21 pixels, 16 frames (4 enemies x 4 frames each)
 * Row 0: Inspector (purple), Row 1: Manager (brown),
 * Row 2: Patron (green), Row 3: Mr. Angry (red)
 */
function createEnemiesSprite() {
  const frameWidth = 24;
  const frameHeight = 21;
  const framesPerEnemy = 4;
  const enemies = 4;

  const canvas = createCanvas(frameWidth * framesPerEnemy * enemies, frameHeight);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const enemyColors = [PALETTE.PURPLE, PALETTE.BROWN, PALETTE.GREEN, PALETTE.RED];
  const enemyNames = ['Inspector', 'Manager', 'Patron', 'Mr. Angry'];

  for (let e = 0; e < enemies; e++) {
    for (let f = 0; f < framesPerEnemy; f++) {
      const x = (e * framesPerEnemy + f) * frameWidth;

      // Body
      ctx.fillStyle = enemyColors[e];
      ctx.fillRect(x + 6, 6, 12, 12);

      // Head
      ctx.fillStyle = PALETTE.LIGHT_GRAY;
      ctx.fillRect(x + 8, 2, 8, 6);

      // Angry eyes for Mr. Angry
      if (e === 3) {
        ctx.fillStyle = PALETTE.WHITE;
        ctx.fillRect(x + 9, 3, 2, 2);
        ctx.fillRect(x + 13, 3, 2, 2);
        ctx.fillStyle = PALETTE.BLACK;
        ctx.fillRect(x + 10, 4, 1, 1);
        ctx.fillRect(x + 14, 4, 1, 1);
      }

      // Legs (animate)
      ctx.fillStyle = PALETTE.DARK_GRAY;
      const legOffset = (f % 2) * 2;
      ctx.fillRect(x + 7 + legOffset, 18, 4, 3);
      ctx.fillRect(x + 13 - legOffset, 18, 4, 3);
    }
  }

  savePNG(canvas, 'assets/sprites/enemies.png');
}

/**
 * Items sprite sheet: 16x16 pixels, 4 frames
 * Frame 0: Pass (yellow), Frame 1: Key (orange),
 * Frame 2: Camera (gray), Frame 3: Bulb (white)
 */
function createItemsSprite() {
  const frameSize = 16;
  const frames = 4;

  const canvas = createCanvas(frameSize * frames, frameSize);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Pass (ID card - yellow)
  ctx.fillStyle = PALETTE.YELLOW;
  ctx.fillRect(2, 3, 12, 10);
  ctx.fillStyle = PALETTE.WHITE;
  ctx.fillRect(4, 5, 4, 4);
  ctx.fillStyle = PALETTE.DARK_GRAY;
  ctx.fillRect(9, 6, 4, 2);
  ctx.fillRect(9, 9, 4, 2);

  // Key (orange)
  ctx.fillStyle = PALETTE.ORANGE;
  ctx.fillRect(16 + 3, 6, 10, 4);
  ctx.fillRect(16 + 2, 5, 4, 6);
  ctx.fillStyle = PALETTE.BLACK;
  ctx.fillRect(16 + 10, 7, 2, 2);

  // Camera (gray)
  ctx.fillStyle = PALETTE.DARK_GRAY;
  ctx.fillRect(32 + 2, 5, 12, 8);
  ctx.fillStyle = PALETTE.MEDIUM_GRAY;
  ctx.fillRect(32 + 4, 7, 5, 5);
  ctx.fillStyle = PALETTE.LIGHT_BLUE;
  ctx.fillRect(32 + 5, 8, 3, 3);
  ctx.fillStyle = PALETTE.BLACK;
  ctx.fillRect(32 + 10, 3, 4, 3);

  // Bulb/Flash (white/yellow)
  ctx.fillStyle = PALETTE.YELLOW;
  ctx.fillRect(48 + 5, 2, 6, 8);
  ctx.fillStyle = PALETTE.WHITE;
  ctx.fillRect(48 + 6, 3, 4, 5);
  ctx.fillStyle = PALETTE.MEDIUM_GRAY;
  ctx.fillRect(48 + 5, 10, 6, 4);

  savePNG(canvas, 'assets/sprites/items.png');
}

/**
 * Doors sprite sheet: 16x32 pixels, 4 frames
 * Frame 0: Closed, Frame 1-2: Opening, Frame 3: Open
 */
function createDoorsSprite() {
  const frameWidth = 16;
  const frameHeight = 32;
  const frames = 4;

  const canvas = createCanvas(frameWidth * frames, frameHeight);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let f = 0; f < frames; f++) {
    const x = f * frameWidth;

    // Door frame
    ctx.fillStyle = PALETTE.BROWN;
    ctx.fillRect(x, 0, frameWidth, frameHeight);

    // Door panel (gets smaller as it opens)
    const openAmount = f * 4; // How much the door has opened
    ctx.fillStyle = PALETTE.ORANGE;
    ctx.fillRect(x + 2, 2, frameWidth - 4 - openAmount, frameHeight - 4);

    // Door handle (only on closed/partially open)
    if (f < 3) {
      ctx.fillStyle = PALETTE.YELLOW;
      ctx.fillRect(x + 10 - openAmount, 16, 2, 3);
    }

    // Dark interior visible when open
    if (f > 0) {
      ctx.fillStyle = PALETTE.BLACK;
      ctx.fillRect(x + frameWidth - 2 - openAmount, 2, openAmount, frameHeight - 4);
    }
  }

  savePNG(canvas, 'assets/sprites/doors.png');
}

/**
 * Tileset: 16x16 tiles, 8x4 grid (32 tiles)
 * Basic tiles for floor, walls, elevator, stairs, conveyor
 */
function createTileset() {
  const tileSize = 16;
  const cols = 8;
  const rows = 4;

  const canvas = createCanvas(tileSize * cols, tileSize * rows);
  const ctx = canvas.getContext('2d');

  // Fill with transparency
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Helper to draw tile at grid position
  function drawTile(col, row, drawFn) {
    const x = col * tileSize;
    const y = row * tileSize;
    ctx.save();
    ctx.translate(x, y);
    drawFn(ctx, tileSize);
    ctx.restore();
  }

  // Tile 0: Empty/transparent (already clear)

  // Tile 1: Floor
  drawTile(1, 0, (ctx, size) => {
    ctx.fillStyle = PALETTE.MEDIUM_GRAY;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = PALETTE.DARK_GRAY;
    ctx.fillRect(0, 0, size, 2);
  });

  // Tile 2: Wall top
  drawTile(2, 0, (ctx, size) => {
    ctx.fillStyle = PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = PALETTE.BLUE;
    ctx.fillRect(0, size - 4, size, 4);
  });

  // Tile 3: Wall middle
  drawTile(3, 0, (ctx, size) => {
    ctx.fillStyle = PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 0, size, size);
    // Brick pattern
    ctx.fillStyle = PALETTE.BLUE;
    ctx.fillRect(0, 4, size, 1);
    ctx.fillRect(0, 11, size, 1);
    ctx.fillRect(4, 0, 1, 4);
    ctx.fillRect(12, 4, 1, 7);
    ctx.fillRect(4, 11, 1, 5);
  });

  // Tile 4: Wall bottom
  drawTile(4, 0, (ctx, size) => {
    ctx.fillStyle = PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = PALETTE.BLUE;
    ctx.fillRect(0, 0, size, 4);
  });

  // Tile 5: Elevator shaft background
  drawTile(5, 0, (ctx, size) => {
    ctx.fillStyle = PALETTE.DARK_GRAY;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = PALETTE.BLACK;
    ctx.fillRect(2, 0, 2, size);
    ctx.fillRect(size - 4, 0, 2, size);
  });

  // Tile 6: Elevator platform
  drawTile(6, 0, (ctx, size) => {
    ctx.fillStyle = PALETTE.MEDIUM_GRAY;
    ctx.fillRect(0, 4, size, size - 4);
    ctx.fillStyle = PALETTE.LIGHT_GRAY;
    ctx.fillRect(0, 4, size, 4);
    ctx.fillStyle = PALETTE.DARK_GRAY;
    ctx.fillRect(0, size - 2, size, 2);
  });

  // Tile 7: Elevator platform (alt frame)
  drawTile(7, 0, (ctx, size) => {
    ctx.fillStyle = PALETTE.MEDIUM_GRAY;
    ctx.fillRect(0, 2, size, size - 2);
    ctx.fillStyle = PALETTE.LIGHT_GRAY;
    ctx.fillRect(0, 2, size, 4);
    ctx.fillStyle = PALETTE.DARK_GRAY;
    ctx.fillRect(0, size - 2, size, 2);
  });

  // Tile 8: Stairs up-left
  drawTile(0, 1, (ctx, size) => {
    ctx.fillStyle = PALETTE.BROWN;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(0, i * 4, size - (i * 4), 4);
    }
  });

  // Tile 9: Stairs up-right
  drawTile(1, 1, (ctx, size) => {
    ctx.fillStyle = PALETTE.BROWN;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(i * 4, i * 4, size - (i * 4), 4);
    }
  });

  // Tiles 10-13: Conveyor belt animation (4 frames)
  for (let f = 0; f < 4; f++) {
    drawTile(2 + f, 1, (ctx, size) => {
      ctx.fillStyle = PALETTE.DARK_GRAY;
      ctx.fillRect(0, 4, size, 8);
      // Animated belt lines
      ctx.fillStyle = PALETTE.YELLOW;
      const offset = f * 4;
      for (let i = -1; i < 4; i++) {
        const lineX = ((i * 8 + offset) % size + size) % size;
        ctx.fillRect(lineX, 6, 3, 4);
      }
      // Rollers
      ctx.fillStyle = PALETTE.MEDIUM_GRAY;
      ctx.fillRect(0, 4, 4, 2);
      ctx.fillRect(size - 4, 4, 4, 2);
      ctx.fillRect(0, size - 6, 4, 2);
      ctx.fillRect(size - 4, size - 6, 4, 2);
    });
  }

  // Tile 14: Door frame left
  drawTile(6, 1, (ctx, size) => {
    ctx.fillStyle = PALETTE.BROWN;
    ctx.fillRect(size - 4, 0, 4, size);
    ctx.fillStyle = PALETTE.ORANGE;
    ctx.fillRect(size - 3, 0, 2, size);
  });

  // Tile 15: Door frame right
  drawTile(7, 1, (ctx, size) => {
    ctx.fillStyle = PALETTE.BROWN;
    ctx.fillRect(0, 0, 4, size);
    ctx.fillStyle = PALETTE.ORANGE;
    ctx.fillRect(1, 0, 2, size);
  });

  // Row 2: Decorative tiles

  // Tile 16: Window
  drawTile(0, 2, (ctx, size) => {
    ctx.fillStyle = PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = PALETTE.CYAN;
    ctx.fillRect(2, 2, size - 4, size - 4);
    ctx.fillStyle = PALETTE.BLUE;
    ctx.fillRect(7, 2, 2, size - 4);
    ctx.fillRect(2, 7, size - 4, 2);
  });

  // Tile 17: Sign/Picture
  drawTile(1, 2, (ctx, size) => {
    ctx.fillStyle = PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = PALETTE.BROWN;
    ctx.fillRect(2, 4, size - 4, size - 8);
    ctx.fillStyle = PALETTE.YELLOW;
    ctx.fillRect(4, 6, size - 8, size - 12);
  });

  // Tile 18: Solid block (collision)
  drawTile(2, 2, (ctx, size) => {
    ctx.fillStyle = PALETTE.DARK_GRAY;
    ctx.fillRect(0, 0, size, size);
  });

  // Tile 19: Platform top
  drawTile(3, 2, (ctx, size) => {
    ctx.fillStyle = PALETTE.MEDIUM_GRAY;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = PALETTE.LIGHT_GRAY;
    ctx.fillRect(0, 0, size, 4);
  });

  // Tile 20: Background (dark blue)
  drawTile(4, 2, (ctx, size) => {
    ctx.fillStyle = PALETTE.BLUE;
    ctx.fillRect(0, 0, size, size);
  });

  // Tile 21: Background with pattern
  drawTile(5, 2, (ctx, size) => {
    ctx.fillStyle = PALETTE.BLUE;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = PALETTE.LIGHT_BLUE;
    ctx.fillRect(4, 4, 2, 2);
    ctx.fillRect(10, 10, 2, 2);
  });

  // Tile 22: Polly's room marker (star)
  drawTile(6, 2, (ctx, size) => {
    ctx.fillStyle = PALETTE.PURPLE;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = PALETTE.YELLOW;
    ctx.fillRect(6, 2, 4, 12);
    ctx.fillRect(2, 6, 12, 4);
  });

  // Tile 23: Goal marker
  drawTile(7, 2, (ctx, size) => {
    ctx.fillStyle = PALETTE.LIGHT_GREEN;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = PALETTE.GREEN;
    ctx.fillRect(4, 4, 8, 8);
  });

  // Row 3: More tiles

  // Tile 24: Ceiling
  drawTile(0, 3, (ctx, size) => {
    ctx.fillStyle = PALETTE.DARK_GRAY;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = PALETTE.MEDIUM_GRAY;
    ctx.fillRect(0, size - 4, size, 4);
  });

  // Tile 25: Floor with carpet
  drawTile(1, 3, (ctx, size) => {
    ctx.fillStyle = PALETTE.RED;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = PALETTE.LIGHT_RED;
    ctx.fillRect(0, 0, size, 2);
  });

  // Remaining tiles can stay empty for now

  savePNG(canvas, 'assets/sprites/tileset.png');
}

// Create Polly Platinum sprite (bonus)
function createPollySprite() {
  const frameWidth = 24;
  const frameHeight = 21;
  const frames = 2;

  const canvas = createCanvas(frameWidth * frames, frameHeight);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let f = 0; f < frames; f++) {
    const x = f * frameWidth;

    // Dress (purple/glamorous)
    ctx.fillStyle = PALETTE.PURPLE;
    ctx.fillRect(x + 6, 8, 12, 10);

    // Blonde hair
    ctx.fillStyle = PALETTE.YELLOW;
    ctx.fillRect(x + 7, 1, 10, 8);

    // Face
    ctx.fillStyle = PALETTE.LIGHT_RED;
    ctx.fillRect(x + 9, 3, 6, 5);

    // Legs (crossing animation)
    ctx.fillStyle = PALETTE.LIGHT_RED;
    if (f === 0) {
      ctx.fillRect(x + 8, 18, 4, 3);
      ctx.fillRect(x + 12, 18, 4, 3);
    } else {
      ctx.fillRect(x + 9, 18, 6, 3);
    }

    // Star sparkle (glamour)
    ctx.fillStyle = PALETTE.WHITE;
    ctx.fillRect(x + 18, 2, 2, 2);
  }

  savePNG(canvas, 'assets/sprites/polly.png');
}

// Run all generators
console.log('Generating placeholder sprites...\n');
createPlayerSprite();
createEnemiesSprite();
createItemsSprite();
createDoorsSprite();
createTileset();
createPollySprite();
console.log('\nAll placeholder sprites created!');
