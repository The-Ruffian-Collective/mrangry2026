# PRD: Mr. Angry - Web-Based Spiritual Successor

## Introduction

A web-based spiritual successor to the classic 1985 Commodore 64 game "Mr. Angry" (originally "Stringer"). The player controls a freelance photographer navigating a multi-floor hotel, collecting equipment while evading pursuing hotel staff, ultimately photographing a celebrity. This single-level implementation captures the core gameplay loop, visual aesthetic, and tension of the original while being accessible in modern browsers.

**Target Platform:** Web (desktop browsers, mobile-friendly)
**Framework:** Phaser 3
**Visual Style:** C64-inspired pixel art (320×200 base resolution, 16-color palette)
**Audio:** Retro chiptune SFX via ZzFX (no background music, matching original)

---

## Goals

- Deliver a fully playable single-level experience faithful to Mr. Angry's core mechanics
- Achieve authentic C64 aesthetic using the Pepto colour palette and pixel-perfect rendering
- Implement responsive enemy AI that creates genuine tension and challenge
- Create a complete gameplay loop: collect items → avoid enemies → photograph target → win
- Ensure smooth 60fps performance across modern browsers
- Support both keyboard and touch/gamepad controls

---

## User Stories

### US-001: Project Scaffolding & Phaser Setup
**Description:** As a developer, I need a working Phaser 3 project structure so I can begin building game features.

**Acceptance Criteria:**
- [ ] `index.html` loads Phaser 3 via CDN or npm
- [ ] Phaser config uses 320×200 resolution with `pixelArt: true`
- [ ] Scale manager configured for 3× integer scaling, centered
- [ ] Basic scene structure: BootScene, MenuScene, GameScene
- [ ] Game displays coloured background confirming Phaser is running
- [ ] Typecheck/lint passes (if using TypeScript/ESLint)

---

### US-002: C64 Colour Palette & Visual Foundation
**Description:** As a player, I want the game to look authentically retro so it captures the C64 aesthetic.

**Acceptance Criteria:**
- [ ] All 16 C64 Pepto palette colours defined as constants
- [ ] Background uses appropriate C64 colours (dark blue or black)
- [ ] CRT scanline shader or CSS overlay available (optional toggle)
- [ ] No anti-aliasing on any sprites or text
- [ ] Verify in browser: visuals are crisp with no blurring

---

### US-003: Tilemap System & Level Layout
**Description:** As a developer, I need a tilemap system to construct hotel floors efficiently.

**Acceptance Criteria:**
- [ ] Tileset created with 8×8 or 16×16 pixel tiles
- [ ] Tiles include: floor, wall, door-frame, elevator-shaft, stairs, conveyor
- [ ] Level loaded from JSON tilemap (Tiled editor format)
- [ ] Single level contains 3-5 floors connected by elevators and stairs
- [ ] Collision layer correctly blocks player/enemy movement
- [ ] Verify in browser: level renders correctly with all tile types visible

---

### US-004: Player Character & Movement
**Description:** As a player, I want to control the photographer so I can navigate the hotel.

**Acceptance Criteria:**
- [ ] Player sprite (24×21 pixels) with idle and 4-frame walk animation
- [ ] Keyboard controls: Arrow keys or WASD for movement
- [ ] Player moves smoothly left/right on floors
- [ ] Player can ascend/descend stairs when positioned correctly
- [ ] Player can enter/exit elevators (up/down input while on elevator)
- [ ] Player cannot walk through walls or off-screen
- [ ] Falling from any height (even one step) triggers death
- [ ] Verify in browser: movement feels responsive and accurate

---

### US-005: Door System
**Description:** As a player, I want to interact with doors to search for items and avoid Mr. Angry.

**Acceptance Criteria:**
- [ ] 8-12 door sprites placed throughout the level
- [ ] Doors have open/closed states with distinct visuals
- [ ] Player can open/close doors with action button (Space/Enter)
- [ ] Doors reveal contents when opened (item, enemy, or empty)
- [ ] One specific door contains Mr. Angry (triggers wake behaviour)
- [ ] One specific door is the goal (Polly Platinum's room)
- [ ] Door contents randomised on level start (except goal door position)
- [ ] Verify in browser: doors animate and reveal contents correctly

---

### US-006: Collectible Items
**Description:** As a player, I want to collect photography equipment to complete my objective.

**Acceptance Criteria:**
- [ ] Four item types: Pass, Key, Camera, Lightbulb (Flash)
- [ ] Each item has distinct 16×16 pixel sprite
- [ ] Items appear behind doors when opened
- [ ] Player collects item by touching it (auto-pickup)
- [ ] Collected items shown in HUD inventory display
- [ ] Items can be collected in any order
- [ ] Audio feedback on item collection (ZzFX pickup sound)
- [ ] Verify in browser: items display, collect, and appear in HUD

---

### US-007: Enemy AI - Basic Pursuit
**Description:** As a player, I want enemies to chase me so the game creates tension.

**Acceptance Criteria:**
- [ ] Three initial enemies: Hotel Inspector, Manager, Bar Patron
- [ ] Each enemy has distinct sprite (24×21 pixels, 2-4 frame animation)
- [ ] Enemies spawn at designated starting positions
- [ ] Enemies pathfind toward player position
- [ ] Enemies can use elevators and stairs
- [ ] Enemies CANNOT use conveyor belts
- [ ] Enemy speed slightly slower than player (catchable but escapable)
- [ ] Verify in browser: enemies pursue player across floors

---

### US-008: Mr. Angry - Triggered Enemy
**Description:** As a player, I want a dangerous enemy that activates when I disturb him, raising stakes.

**Acceptance Criteria:**
- [ ] Mr. Angry hidden behind one randomised door
- [ ] Opening his door triggers "wake" animation and sound
- [ ] Once awake, Mr. Angry pursues relentlessly (faster than other enemies)
- [ ] Mr. Angry uses same pathfinding as other enemies
- [ ] Visual distinction: angry expression, possibly red-tinted
- [ ] Verify in browser: Mr. Angry activates and pursues when door opened

---

### US-009: Collision & Death System
**Description:** As a player, I want clear feedback when I'm caught so I understand failure.

**Acceptance Criteria:**
- [ ] Player-enemy collision detected using arcade physics overlap
- [ ] Contact with ANY enemy triggers death sequence
- [ ] Death animation: player flashes or plays caught animation
- [ ] Death sound effect plays (ZzFX)
- [ ] Player loses one life on death
- [ ] Player respawns at level start with enemies reset
- [ ] Three lives total; game over on zero lives
- [ ] Verify in browser: collision triggers death reliably

---

### US-010: Elevator Mechanics
**Description:** As a player, I want to use elevators to move between floors quickly.

**Acceptance Criteria:**
- [ ] 2 elevator shafts spanning all floors
- [ ] Player enters elevator by walking into shaft and pressing up/down
- [ ] Elevator platform moves vertically with player on it
- [ ] Enemies can also use elevators (enter and ride)
- [ ] Player can exit elevator on any floor
- [ ] Elevator has subtle animation (platform movement, optional doors)
- [ ] Verify in browser: elevators transport player between floors

---

### US-011: Stair Mechanics
**Description:** As a player, I want to use stairs to move between adjacent floors.

**Acceptance Criteria:**
- [ ] Stairs connect adjacent floors only (not skip floors)
- [ ] Player ascends/descends stairs with up/down input
- [ ] Movement on stairs is continuous (no teleporting)
- [ ] Falling from stairs (walking off edge) triggers death
- [ ] Enemies can use stairs
- [ ] Verify in browser: stair traversal works bidirectionally

---

### US-012: Conveyor Belt Mechanics
**Description:** As a player, I want conveyor belts to add strategic escape options.

**Acceptance Criteria:**
- [ ] Conveyor belt tiles on upper floor(s)
- [ ] Conveyor animates to show direction of movement
- [ ] Player standing on conveyor is pushed in belt direction
- [ ] Player can walk against conveyor (slower movement)
- [ ] Enemies CANNOT traverse conveyors (blocked or pushed off)
- [ ] Verify in browser: conveyor affects player, blocks enemies

---

### US-013: Win Condition - Photographing Polly
**Description:** As a player, I want to complete the level by photographing the celebrity.

**Acceptance Criteria:**
- [ ] Goal door (Polly's room) at fixed position (leftmost door, top floor)
- [ ] Door only opens if player has ALL four items
- [ ] Opening goal door reveals Polly Platinum sprite
- [ ] Polly has simple animation (posing, crossing legs)
- [ ] Player presses action button near Polly to take photo
- [ ] Camera flash effect on photograph
- [ ] Level complete screen with score display
- [ ] Verify in browser: full win sequence plays correctly

---

### US-014: HUD & UI Elements
**Description:** As a player, I want clear information about my status so I can make decisions.

**Acceptance Criteria:**
- [ ] Lives remaining displayed (top-left, icon or number)
- [ ] Inventory slots showing collected items (4 slots)
- [ ] Timer countdown displayed (top-right)
- [ ] Score display
- [ ] All HUD uses C64-style bitmap font
- [ ] HUD does not obscure gameplay area
- [ ] Verify in browser: all HUD elements visible and updating

---

### US-015: Timer System
**Description:** As a player, I want time pressure to create urgency.

**Acceptance Criteria:**
- [ ] Level starts with 120-second countdown (adjustable)
- [ ] Timer displays in MM:SS format
- [ ] Warning visual/audio when timer below 30 seconds
- [ ] Timer reaching zero costs one life
- [ ] Timer resets on respawn
- [ ] Time bonus added to score on level completion
- [ ] Verify in browser: timer counts down and triggers appropriately

---

### US-016: Audio System
**Description:** As a player, I want retro sound effects to enhance the experience.

**Acceptance Criteria:**
- [ ] ZzFX integrated for procedural sound generation
- [ ] Sound effects for: door open/close, item pickup, death, enemy alert, photograph, timer warning
- [ ] Mr. Angry wake-up has distinct alarming sound
- [ ] Audio can be muted via settings or key press (M)
- [ ] No background music (faithful to original)
- [ ] Verify in browser: all sounds play at appropriate moments

---

### US-017: Menu Screen
**Description:** As a player, I want a title screen so I can start the game when ready.

**Acceptance Criteria:**
- [ ] Title screen displays "MR. ANGRY" in C64-style font
- [ ] Subtitle: "A Spiritual Successor"
- [ ] "PRESS SPACE TO START" flashing prompt
- [ ] Optional: Controls help text
- [ ] Optional: Credits ("Original by Steve Wiggins, 1985")
- [ ] Transition to GameScene on input
- [ ] Verify in browser: menu displays and transitions correctly

---

### US-018: Game Over & Restart
**Description:** As a player, I want clear end states so I know the outcome.

**Acceptance Criteria:**
- [ ] Game Over screen on zero lives
- [ ] Displays final score
- [ ] "PRESS SPACE TO RETRY" prompt
- [ ] Retry returns to menu or restarts level
- [ ] High score tracking (localStorage)
- [ ] Verify in browser: game over flow works correctly

---

### US-019: Touch/Mobile Controls
**Description:** As a mobile player, I want on-screen controls so I can play without a keyboard.

**Acceptance Criteria:**
- [ ] Virtual D-pad displayed on touch devices
- [ ] Action button for door/item interaction
- [ ] Controls positioned for thumb access
- [ ] Controls semi-transparent to not obscure game
- [ ] Touch controls hidden on desktop
- [ ] Verify on mobile browser: controls are responsive and usable

---

### US-020: Pause Functionality
**Description:** As a player, I want to pause the game so I can take breaks.

**Acceptance Criteria:**
- [ ] Press P or Escape to pause
- [ ] "PAUSED" overlay displayed
- [ ] All game logic frozen (timer, enemies, player)
- [ ] Press same key to resume
- [ ] Verify in browser: pause fully stops game state

---

## Functional Requirements

- **FR-01:** Game runs in Phaser 3 at 320×200 resolution scaled 3× with pixel-perfect rendering
- **FR-02:** All visuals use the 16-color C64 Pepto palette exclusively
- **FR-03:** Player sprite moves at 80 pixels/second; enemies at 60 pixels/second
- **FR-04:** Level consists of 3-5 floors, 8-12 doors, 2 elevators, connecting stairs
- **FR-05:** Four collectible items randomly placed behind doors each game
- **FR-06:** Mr. Angry's door position randomised; Polly's door fixed at top-left
- **FR-07:** Enemy AI recalculates path to player every 500ms
- **FR-08:** Enemies cannot traverse conveyor belt tiles
- **FR-09:** Player death on any enemy contact or falling from stairs
- **FR-10:** Timer starts at 120 seconds; zero triggers life loss
- **FR-11:** Win condition requires all 4 items + photograph action at Polly's door
- **FR-12:** Score = (items collected × points) + (time remaining × multiplier)
- **FR-13:** High score persists in browser localStorage
- **FR-14:** All audio generated via ZzFX; no external audio files required
- **FR-15:** Game supports keyboard (arrows/WASD + Space) and touch (virtual D-pad)

---

## Non-Goals (Out of Scope)

- Multiple levels (this is a single-level implementation)
- Online leaderboards or multiplayer
- Level editor
- Authentic SID music playback (only SFX)
- Exact pixel-for-pixel recreation of original sprites (spiritual successor)
- Save/load mid-game progress
- Additional enemy types beyond the core five
- Power-ups or special abilities
- Difficulty selection (single balanced difficulty)
- Achievements or unlockables

---

## Design Considerations

### Visual Style
- Chunky pixel art with visible pixels (no smoothing)
- High contrast between player, enemies, and background
- Clear silhouette readability for all characters
- Doors should be obviously interactive
- Items should "pop" visually when revealed

### Level Layout Principles
- Clear sight lines so player can plan routes
- Multiple paths between floors to allow strategy
- Conveyor belt placement creates risk/reward decisions
- Goal door visible from start but requires traversal

### Reference Materials
- Original gameplay: [Internet Archive - Mr. Angry](https://archive.org/details/d64_Mr._Angry_1986_Codemasters)
- GBC remake for mechanics reference: [itch.io](https://lacoste42.itch.io/mr-angry)
- C64 palette reference: Pepto palette

---

## Technical Considerations

### Dependencies
- Phaser 3.60+ (via CDN or npm)
- ZzFX for audio (single JS file, ~1KB)
- Optional: Tiled editor for tilemap creation

### Browser Support
- Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- Mobile: iOS Safari 14+, Chrome Android

### Performance Targets
- 60fps consistent on mid-range devices
- Initial load under 2 seconds
- Total bundle size under 500KB (excluding Phaser)

### File Structure
```
mr-angry-web/
├── index.html
├── package.json
├── src/
│   ├── main.js
│   ├── config.js
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── MenuScene.js
│   │   ├── GameScene.js
│   │   └── GameOverScene.js
│   ├── entities/
│   │   ├── Player.js
│   │   ├── Enemy.js
│   │   ├── MrAngry.js
│   │   └── Item.js
│   ├── systems/
│   │   ├── EnemyAI.js
│   │   ├── DoorManager.js
│   │   ├── ElevatorSystem.js
│   │   └── TimerSystem.js
│   ├── ui/
│   │   ├── HUD.js
│   │   └── TouchControls.js
│   └── audio/
│       └── SoundManager.js
├── assets/
│   ├── sprites/
│   │   ├── player.png
│   │   ├── enemies.png
│   │   ├── items.png
│   │   └── tileset.png
│   ├── tilemaps/
│   │   └── level1.json
│   └── fonts/
│       └── c64-font.png
└── tasks/
    ├── prd.md
    ├── tdd.md
    └── plan.md
```

---

## Success Metrics

- **Playability:** Complete gameplay loop achievable in 2-3 minutes
- **Performance:** Consistent 60fps on Chrome/Firefox desktop
- **Authenticity:** Recognisably "C64-style" to retro gaming enthusiasts
- **Engagement:** Win/lose states create desire to retry
- **Code Quality:** Clean separation of concerns; no god objects

---

## Open Questions

1. Should difficulty increase on subsequent plays (more enemies, less time)?
2. Include optional CRT shader for extra authenticity?
3. Add brief tutorial overlay for first-time players?
4. Include "attract mode" demo on title screen?
5. Exact scoring formula to balance time vs. item collection?
