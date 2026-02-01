# CLAUDE.md - Mr. Angry 2026

## Project Overview

Web-based spiritual successor to the 1985 C64 game "Mr. Angry" (originally "Stringer"). A single-screen platformer where a freelance photographer navigates a multi-floor hotel, collecting equipment while evading pursuing staff, to photograph a celebrity.

**Framework:** Phaser 3.60+
**Build Tool:** Vite
**Audio:** ZzFX (procedural)
**Resolution:** 320x200 scaled 3x (960x600)
**Visual Style:** C64 Pepto 16-color palette

## Quick Commands

```bash
npm install     # Install dependencies
npm run dev     # Start dev server at localhost:3000
npm run build   # Production build to dist/
npm run preview # Preview production build
```

## Project Structure

```
mr-angry-2026/
├── index.html              # Game container with pixel-art CSS
├── package.json            # Phaser + Vite dependencies
├── vite.config.js          # Dev server config
├── src/
│   ├── main.js             # Phaser game instantiation
│   ├── config.js           # Phaser config (320x200, pixelArt: true)
│   ├── constants/
│   │   ├── palette.js      # C64 Pepto 16-color palette
│   │   └── game.js         # Game constants (speeds, scoring, etc.)
│   ├── scenes/
│   │   ├── BootScene.js    # Asset loading, animations
│   │   ├── MenuScene.js    # Title screen, start prompt
│   │   ├── GameScene.js    # Main gameplay
│   │   └── GameOverScene.js
│   ├── entities/
│   │   ├── Player.js       # Player sprite + state
│   │   ├── Enemy.js        # Base enemy class
│   │   └── MrAngry.js      # Special triggered enemy
│   ├── systems/
│   │   ├── EnemyAI.js      # Waypoint-based pathfinding
│   │   ├── DoorManager.js  # Door interaction, item/enemy placement
│   │   ├── ElevatorSystem.js
│   │   └── TimerSystem.js
│   ├── ui/
│   │   ├── HUD.js          # Lives, inventory, timer, score
│   │   └── TouchControls.js
│   └── audio/
│       └── SoundManager.js # ZzFX integration
├── assets/
│   ├── sprites/            # player.png, enemies.png, items.png, doors.png, tileset.png
│   ├── tilemaps/           # level1.json (Tiled format)
│   └── fonts/              # C64 bitmap font
└── docs/
    ├── prd.md              # Product Requirements (what to build)
    ├── tdd.md              # Technical Design (how to build)
    └── plan.md             # Implementation phases
```

## Key Technical Details

### Phaser Config
- Resolution: 320x200 with `pixelArt: true`, `roundPixels: true`
- Scale: `Phaser.Scale.FIT` with `zoom: 3`
- Physics: Arcade with `gravity: { y: 0 }`

### C64 Pepto Palette
```javascript
BLACK: 0x000000, WHITE: 0xFFFFFF, RED: 0x68372B, CYAN: 0x70A4B2,
PURPLE: 0x6F3D86, GREEN: 0x588D43, BLUE: 0x352879, YELLOW: 0xB8C76F,
ORANGE: 0x6F4F25, BROWN: 0x433900, LIGHT_RED: 0x9A6759, DARK_GRAY: 0x444444,
MEDIUM_GRAY: 0x6C6C6C, LIGHT_GREEN: 0x9AD284, LIGHT_BLUE: 0x6C5EB5, LIGHT_GRAY: 0x959595
```

### Game Constants
- Player speed: 80 px/s
- Enemy speed: 60 px/s
- Mr. Angry speed: 90 px/s
- Elevator speed: 40 px/s
- Conveyor speed: 30 px/s
- Starting lives: 3
- Level time: 120 seconds
- AI repath interval: 500ms

### Sprite Sizes
- Player/Enemies: 24x21 pixels
- Items: 16x16 pixels
- Doors: 16x32 pixels
- Tiles: 16x16 pixels

## Core Gameplay Mechanics

1. **Objective:** Collect 4 items (pass, key, camera, bulb) behind random doors, then photograph Polly Platinum
2. **Enemies:** Inspector, Manager, Patron pursue from start; Mr. Angry triggers when his door is opened
3. **Navigation:** Elevators (vertical), stairs (adjacent floors), conveyors (enemies can't use)
4. **Death:** Contact with enemy, falling from stairs, or timer expiration
5. **Win:** Photograph Polly with all items collected

## Implementation Phases

The project follows 8 phases (see docs/plan.md):
1. Project Foundation & Phaser Setup
2. Placeholder Graphics & Menu Screen
3. Tilemap & Level Structure
4. Player Movement & Controls
5. Elevators & Stairs Navigation
6. Doors, Items & Mr. Angry
7. Enemy AI & Collisions
8. Win Condition, HUD & Audio

## Common Patterns

### Scene Transitions
```javascript
this.scene.start('GameScene', { score: this.player.score });
```

### Adding Collisions
```javascript
this.physics.add.collider(this.player, this.collisionLayer);
this.physics.add.overlap(this.player, this.enemies, this.handleDeath, null, this);
```

### Playing ZzFX Sounds
```javascript
this.soundManager.play('item_pickup');
```

## Testing Checklist

- No console errors or 404s
- 60fps on desktop Chrome/Firefox
- Player movement smooth, blocked by walls
- Elevators/stairs functional between all floors
- All 4 items collectable, appear in HUD
- Enemies pursue and use elevators/stairs (not conveyors)
- Mr. Angry triggers on door open
- Death/respawn cycle works
- Win sequence triggers with all items + photograph

## Agent Handover Workflow

When working on this project, follow this workflow to enable smooth handovers:

### Starting Work (New Agent)
1. Read this CLAUDE.md file first
2. Check **docs/project-status.txt** for current state and next steps
3. Review the relevant phase in docs/plan.md
4. Run `npm install && npm run dev` to verify setup

### Completing Work (Before Handover)
1. Update **docs/project-status.txt** with:
   - Mark completed phase as done with commit hash
   - Update "Current State" section
   - Verify "Next Phase" tasks are accurate
2. Commit all changes with descriptive message
3. Push to GitHub
4. Include `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>` in commits

### Project Status File
The **docs/project-status.txt** file contains:
- Completed phases with commit references
- Current working state
- Next phase tasks and verification criteria
- Handover notes for new agents

## Documentation Reference

- **docs/project-status.txt** - Current state & handover info (CHECK FIRST)
- **docs/prd.md** - User stories, acceptance criteria, requirements
- **docs/tdd.md** - Data structures, algorithms, code examples
- **docs/plan.md** - Phase-by-phase implementation tasks
- **research.md** - Original game research, references
- **prompt.md** - Initial Claude Code setup instructions
