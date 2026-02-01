# Implementation Plan: Mr. Angry 2026 Recreation

This document provides a structured, phase-by-phase implementation plan for building the Mr. Angry web game. Each phase is designed to be completable in a focused session, with clear deliverables and verification steps.

---

## Overview

**Total Estimated Phases:** 8  
**Estimated Time:** 15-20 focused development sessions  
**Approach:** Incremental, playable-at-each-phase

---

## Phase 1: Project Foundation & Phaser Setup

### Objective
Establish working project structure with Phaser 3 rendering a coloured screen.

### Tasks

- [ ] **1.1** Create project directory structure:
  ```
  Mr-angry-2026/
  ├── index.html
  ├── package.json
  ├── vite.config.js
  ├── src/
  │   ├── main.js
  │   ├── config.js
  │   ├── constants/
  │   │   ├── palette.js
  │   │   └── game.js
  │   └── scenes/
  │       ├── BootScene.js
  │       ├── MenuScene.js
  │       ├── GameScene.js
  │       └── GameOverScene.js
  └── assets/
      ├── sprites/
      ├── tilemaps/
      └── fonts/
  ```

- [ ] **1.2** Create `package.json` with Phaser and Vite dependencies

- [ ] **1.3** Create `vite.config.js` for development server

- [ ] **1.4** Create `index.html` with game container and pixel-art CSS

- [ ] **1.5** Create `src/constants/palette.js` with C64 Pepto palette (16 colours)

- [ ] **1.6** Create `src/constants/game.js` with game constants (dimensions, speeds, etc.)

- [ ] **1.7** Create `src/config.js` with Phaser config (320×200, pixelArt: true, scale: 3×)

- [ ] **1.8** Create `src/main.js` to instantiate Phaser game

- [ ] **1.9** Create stub scenes (BootScene, MenuScene, GameScene, GameOverScene)

- [ ] **1.10** BootScene transitions to MenuScene after brief delay

### Verification
- Run `npm run dev`
- Browser shows centred 960×600 game area (320×200 scaled 3×)
- Background colour is C64 dark blue (#352879)
- No console errors

### Deliverables
- Working dev server at localhost:3000
- Phaser game instance running
- Scene flow: Boot → Menu

---

## Phase 2: Placeholder Graphics & Menu Screen

### Objective
Create simple placeholder sprites and a functional menu screen.

### Tasks

- [ ] **2.1** Create placeholder `player.png` (24×21 pixels, solid colour rectangle, 8 frames)

- [ ] **2.2** Create placeholder `enemies.png` (24×21 pixels, 4 different colours, 16 frames)

- [ ] **2.3** Create placeholder `items.png` (16×16 pixels, 4 different coloured squares)

- [ ] **2.4** Create placeholder `doors.png` (16×32 pixels, 4 frames for open/close)

- [ ] **2.5** Create placeholder `tileset.png` (16×16 tiles, basic floor/wall/elevator patterns)

- [ ] **2.6** Update BootScene to preload all placeholder assets

- [ ] **2.7** Create MenuScene with:
  - Title text "MR. ANGRY 2026" (using Phaser text, C64 style)
  - Subtitle "A Spiritual Successor"
  - Flashing "PRESS SPACE TO START" prompt
  - Keyboard listener for Space → transition to GameScene

- [ ] **2.8** Create basic GameScene that displays "GAME SCENE" text

- [ ] **2.9** Create basic GameOverScene with "GAME OVER" text and restart option

### Verification
- Menu screen displays with styled text
- Space key starts game (transitions to GameScene)
- All assets load without 404 errors
- Can navigate: Menu → Game → GameOver → Menu

### Deliverables
- Complete asset loading pipeline
- Functional menu with start prompt
- Scene navigation working

---

## Phase 3: Tilemap & Level Structure

### Objective
Create and load a playable level layout with collision.

### Tasks

- [ ] **3.1** Design level layout on paper/digitally:
  - 4 floors (320×200 space)
  - 10 door positions marked
  - 2 elevator shaft positions
  - Stair connections between floors
  - Conveyor belt on top floor

- [ ] **3.2** Create `level1.json` tilemap (manual JSON or Tiled export):
  - Background layer (decorative)
  - Collision layer (walls, floors)
  - Objects layer (spawn points, doors, elevators)

- [ ] **3.3** Update BootScene to load tilemap JSON

- [ ] **3.4** Update GameScene to:
  - Load and display tilemap
  - Create collision layer from tilemap
  - Parse object layer for spawn points

- [ ] **3.5** Verify collision layer blocks movement (test with static sprite)

- [ ] **3.6** Add floor Y-positions to game constants for pathfinding reference

### Verification
- Level renders with all 4 floors visible
- Walls and floor platforms clearly defined
- Elevator shafts visible as vertical channels
- Stair areas marked (can be placeholder tiles)
- Object positions logged to console (doors, spawns)

### Deliverables
- Complete tilemap file
- Level rendering in GameScene
- Collision layer functional

---

## Phase 4: Player Movement & Controls

### Objective
Implement fully controllable player character.

### Tasks

- [ ] **4.1** Create `src/entities/Player.js` class:
  - Extends Phaser.Physics.Arcade.Sprite
  - State object (lives, inventory, isDead, etc.)
  - hasAllItems() method

- [ ] **4.2** Instantiate player in GameScene at spawn point

- [ ] **4.3** Add player to physics system with collision against tilemap

- [ ] **4.4** Implement keyboard input handling:
  - Arrow keys + WASD for movement
  - Space for action (stub for now)
  - P for pause (stub)
  - M for mute (stub)

- [ ] **4.5** Implement horizontal movement:
  - Smooth left/right movement at PLAYER_SPEED
  - Sprite flipping based on direction
  - Walk animation (or placeholder frame swap)

- [ ] **4.6** Implement conveyor belt effect:
  - Detect if player on conveyor tiles
  - Apply horizontal push

- [ ] **4.7** Implement basic stair detection (enter/exit stair zones)

- [ ] **4.8** Implement death from falling (if player Y exceeds floor + threshold)

- [ ] **4.9** Add player idle animation when not moving

### Verification
- Player spawns at correct position
- Player moves smoothly left/right
- Player cannot pass through walls
- Conveyor belt pushes player
- Player can walk onto stair zones (visual indication)
- Player sprite faces direction of movement

### Deliverables
- Controllable player character
- Collision with environment
- Conveyor mechanics working

---

## Phase 5: Elevators & Stairs Navigation

### Objective
Implement vertical traversal systems.

### Tasks

- [ ] **5.1** Create `src/systems/ElevatorSystem.js`:
  - Parse elevator positions from tilemap
  - Create elevator platform sprites
  - Track rider state

- [ ] **5.2** Implement elevator entry:
  - Player presses up/down near elevator
  - Player snaps to elevator X position
  - Player state set to isOnElevator

- [ ] **5.3** Implement elevator movement:
  - Up/down input moves platform + rider
  - Clamp to floor Y positions
  - Stop at top/bottom bounds

- [ ] **5.4** Implement elevator exit:
  - Left/right input while on elevator exits
  - Player state cleared

- [ ] **5.5** Implement stair traversal:
  - Detect stair entry zones
  - Up/down input moves player diagonally
  - Player state set to isOnStairs

- [ ] **5.6** Implement stair exit:
  - Reaching top/bottom of stairs changes floor
  - Player state cleared

- [ ] **5.7** Implement fall death on stairs:
  - Walking off stair edge triggers death
  - Death animation (flash/fade)
  - Life decrement
  - Respawn at level start

### Verification
- Player can ride elevators between all floors
- Elevator movement smooth and stops at floors
- Player can exit elevator on any floor
- Player can ascend/descend stairs
- Falling from stairs triggers death
- Player respawns after death

### Deliverables
- Fully functional elevator system
- Fully functional stair system
- Death and respawn mechanics

---

## Phase 6: Doors, Items & Mr. Angry

### Objective
Implement interactive doors, collectibles, and the titular antagonist.

### Tasks

- [ ] **6.1** Create `src/systems/DoorManager.js`:
  - Door class with state (closed, open, contents)
  - Parse door positions from tilemap
  - Create door sprites

- [ ] **6.2** Implement door interaction:
  - Player presses Space near door
  - Door plays open/close animation
  - Contents revealed on first open

- [ ] **6.3** Implement item randomisation:
  - Place 4 items (pass, key, camera, bulb) behind random doors
  - Place Mr. Angry behind one random door (not same as items or goal)
  - Mark goal door (Polly's room) at fixed position

- [ ] **6.4** Implement item spawning:
  - When door with item opens, spawn item sprite
  - Item appears in front of door

- [ ] **6.5** Implement item collection:
  - Player overlaps item → collect
  - Play pickup sound
  - Update player inventory
  - Destroy item sprite

- [ ] **6.6** Create `src/entities/MrAngry.js`:
  - Dormant until door opened
  - Wake animation and sound on reveal
  - Faster speed than other enemies

- [ ] **6.7** Implement Mr. Angry awakening:
  - Opening his door triggers spawn
  - Screen flash effect
  - Enemy added to active enemies group

### Verification
- All doors can be opened/closed
- Items appear behind doors
- Items are collectible
- Inventory tracks collected items
- Mr. Angry spawns when his door opened
- Mr. Angry wake effect plays

### Deliverables
- Door interaction system
- Item collection system
- Mr. Angry spawn trigger

---

## Phase 7: Enemy AI & Collisions

### Objective
Implement enemy pursuit AI and player-enemy collision.

### Tasks

- [ ] **7.1** Create `src/systems/EnemyAI.js`:
  - Navigation graph from level data
  - Path calculation methods
  - Floor detection utilities

- [ ] **7.2** Create `src/entities/Enemy.js` base class:
  - Shared state (isActive, currentFloor, targetPosition)
  - Speed based on enemy type
  - Animation handling

- [ ] **7.3** Spawn initial enemies (Inspector, Manager, Patron):
  - Parse spawn positions from tilemap
  - Create enemy instances
  - Add to enemies group

- [ ] **7.4** Implement horizontal pursuit:
  - Enemies on same floor as player move toward them
  - Smooth movement at ENEMY_SPEED
  - Sprite flipping

- [ ] **7.5** Implement vertical pursuit via elevators:
  - Enemies can enter and ride elevators
  - AI decides when to enter elevator
  - AI exits at player's floor

- [ ] **7.6** Implement vertical pursuit via stairs:
  - Enemies can use stairs
  - Move diagonally on stair tiles

- [ ] **7.7** Implement conveyor blocking:
  - Enemies cannot traverse conveyor belt tiles
  - AI avoids conveyor routes

- [ ] **7.8** Implement path recalculation:
  - Every 500ms, enemies recalculate target
  - Prevents stuck enemies

- [ ] **7.9** Implement player-enemy collision:
  - Arcade physics overlap detection
  - Any contact triggers player death
  - Death sequence (flash, respawn)

- [ ] **7.10** Implement game over:
  - Zero lives → transition to GameOverScene
  - Pass final score to scene

### Verification
- Enemies spawn at designated positions
- Enemies pursue player across floors
- Enemies use elevators and stairs
- Enemies blocked by conveyors
- Contact with enemy causes death
- Game over triggers correctly

### Deliverables
- Functional enemy AI
- Multi-floor pursuit
- Death on collision
- Game over flow

---

## Phase 8: Win Condition, HUD & Audio

### Objective
Complete gameplay loop with win condition, UI, and sound.

### Tasks

- [ ] **8.1** Create `src/ui/HUD.js`:
  - Lives display (top-left)
  - Inventory slots (4 items)
  - Timer display (top-right)
  - Score display

- [ ] **8.2** Create `src/systems/TimerSystem.js`:
  - Countdown from 120 seconds
  - Update HUD every second
  - Warning at 30 seconds
  - Zero → player death

- [ ] **8.3** Implement win condition:
  - Goal door opens only if player has all 4 items
  - Polly Platinum sprite revealed
  - Player presses action → photograph
  - Camera flash effect
  - Level complete screen

- [ ] **8.4** Implement scoring:
  - Items: +100/150/200/150 points
  - Photograph: +500 points
  - Time bonus: +10 per second remaining

- [ ] **8.5** Create `src/audio/SoundManager.js`:
  - Integrate ZzFX (inline or import)
  - Define sound parameters for all effects
  - Play methods for each sound

- [ ] **8.6** Add sound effects:
  - Door open/close
  - Item pickup
  - Player death
  - Mr. Angry wake
  - Photograph flash
  - Timer warning
  - Level complete

- [ ] **8.7** Implement mute toggle (M key):
  - Toggle sound manager muted state
  - Visual indicator in HUD

- [ ] **8.8** Implement pause (P key):
  - Freeze all game logic
  - Display "PAUSED" overlay
  - Resume on second press

- [ ] **8.9** Update GameOverScene:
  - Display final score
  - High score check (localStorage)
  - Retry prompt

- [ ] **8.10** Create `src/ui/TouchControls.js` (optional):
  - Virtual D-pad for mobile
  - Action button
  - Show only on touch devices

### Verification
- HUD displays all information correctly
- Timer counts down and triggers death at zero
- Collecting all items allows goal door access
- Photographing Polly triggers win sequence
- Score calculates correctly
- All sound effects play
- Pause freezes game
- High score saves to localStorage
- Full gameplay loop: Start → Play → Win/Lose → Restart

### Deliverables
- Complete HUD
- Timer system
- Win condition and victory sequence
- Full audio integration
- Pause functionality
- High score persistence

---

## Phase 9: Polish & Final Assets (Optional)

### Objective
Replace placeholder graphics and add polish.

### Tasks

- [ ] **9.1** Create final pixel art sprites:
  - Player photographer with walk cycle
  - Distinct enemy characters
  - Detailed items
  - Animated doors

- [ ] **9.2** Create final tileset:
  - Textured floors and walls
  - Decorative elements
  - Animated conveyors

- [ ] **9.3** Add CRT shader (optional):
  - Scanline effect
  - Slight curvature
  - Toggle on/off

- [ ] **9.4** Add screen transitions:
  - Fade between scenes
  - Smooth level reset

- [ ] **9.5** Add attract mode (optional):
  - Demo playthrough on menu after idle

- [ ] **9.6** Mobile optimisation:
  - Touch control refinement
  - Responsive scaling

- [ ] **9.7** Performance testing:
  - 60fps verification
  - Mobile performance check

- [ ] **9.8** Build and deploy:
  - `npm run build`
  - Deploy to hosting

---

## Quick Reference: Phase Dependencies

```
Phase 1: Foundation
    │
    ▼
Phase 2: Placeholders & Menu
    │
    ▼
Phase 3: Tilemap & Level
    │
    ├──────────┐
    ▼          ▼
Phase 4    Phase 6
Player     Doors/Items
    │          │
    ▼          │
Phase 5        │
Elevators/     │
Stairs         │
    │          │
    └────┬─────┘
         ▼
    Phase 7
    Enemies & AI
         │
         ▼
    Phase 8
    Win/HUD/Audio
         │
         ▼
    Phase 9
    Polish (Optional)
```

---

## Checkpoint Milestones

| Milestone | After Phase | What's Playable |
|-----------|-------------|-----------------|
| **M1: Setup** | Phase 1 | Phaser running, scenes transitioning |
| **M2: Visible** | Phase 3 | Level layout visible and rendered |
| **M3: Moving** | Phase 4 | Player can walk around level |
| **M4: Vertical** | Phase 5 | Player can traverse entire level |
| **M5: Collecting** | Phase 6 | Player can open doors and collect items |
| **M6: Chased** | Phase 7 | Enemies pursue, game over possible |
| **M7: Complete** | Phase 8 | Full gameplay loop, winnable game |
| **M8: Polished** | Phase 9 | Final art, sounds, ready for release |

---

## Notes for Claude Code Agent

### Priority Guidance
- **Always start by reading PRD.md and TDD.md** in the docs folder
- Focus on getting each phase fully working before moving to the next
- Placeholder graphics are fine—gameplay first, polish later
- Test frequently—run the game after each task

### Common Pitfalls
- Phaser physics requires sprites added to scene AND physics world
- Tilemap collision uses `setCollisionByProperty` or `setCollisionByExclusion`
- ZzFX must be triggered by user interaction first (browser audio policy)
- Mobile scaling needs viewport meta tag and touch events

### Asset Creation Tips
- Use https://lospec.com/pixel-editor/ for quick sprite creation
- C64 palette constraint: exactly 16 colours, no transparency variations
- Tilemap can be created as JSON manually or via https://www.mapeditor.org/

### Testing Checklist Per Phase
1. No console errors
2. No 404s for assets
3. Feature works as described
4. No performance issues (steady 60fps)
5. Scene transitions work

### Handover Workflow (IMPORTANT)
After completing each phase:
1. Update **docs/project-status.txt** with completed work and next steps
2. **USER VERIFICATION STEP** (Required before committing):
   - Notify user that phase is complete and ready for review
   - User will test the game at localhost:3000
   - Wait for user approval: **YEY** (proceed) or **NEY** (fix issues)
3. Once approved, commit all changes with descriptive message
4. Push to GitHub
5. Include `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>` in commits

When starting work on a new phase:
1. Check **docs/project-status.txt** for current state
2. Verify the previous phase is complete
3. Run `npm install && npm run dev` to confirm setup works

---



