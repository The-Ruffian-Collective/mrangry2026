# Mr. Angry: Complete Game Research Briefing for Web Recreation

A verified 1985 Commodore 64 single-screen platformer, originally titled "Stringer" by Addictive Games and re-released as "Mr. Angry" by Codemasters in 1986, is thoroughly documented across retro gaming archives. The game features a newspaper photographer navigating a **10-floor hotel**, collecting equipment while evading pursuing staff and a sleeping antagonist who wakes when disturbed. **Phaser 3** emerges as the optimal JavaScript framework for recreation due to its built-in pixel art mode, tilemap support, and arcade physics system.

---

## Historical context and credits

**Mr. Angry** was designed and programmed by **Steve Wiggins** with graphics by James Wilson and Wiggins. Originally released in 1985 as "Stringer" by Addictive Games Ltd, Codemasters acquired and re-released it as **catalog #1004** in 1986—one of their earliest C64 titles. The game received an **8/10 rating** on Lemon64, with reviewers calling it "an underrated and forgotten gem" that "has a league quite of its own."

The premise casts the player as a "stringer" (freelance photographer) for the *Daily Blurb* newspaper, tasked with illicitly photographing celebrity model **Polly Platinum** at a hotel. Box text describes it as "ARCADE ACTION - Very playable, fast moving game."

---

## Core game mechanics and design

### Objective and item collection

Players must search behind **randomly-placed doors** to collect four items in any order:
- **Pass** (identification)
- **Key** (to unlock the model's door)
- **Camera** (primary equipment)
- **Lightbulb/Flash** (to complete the camera)

Once all items are collected, the player locates the **leftmost door** on the final screen to photograph Polly Platinum, who "tries to look pretty by crossing her legs every five seconds." Successfully photographing her completes the level.

### Level structure

The game consists of **10 unique screens representing hotel floors**, displayed in a **fixed single-screen format** (no scrolling). After completing all 10 screens, difficulty increases and the cycle repeats with additional enemies. Key structural elements include:

- **Elevators**: Vertical transportation between floors—enemies can use these
- **Stairs**: Connect adjacent floors—falling from even the first step is fatal (noted design flaw)
- **Conveyor belts**: Appear only on **screens 9 and 10**—enemies cannot use these
- **Doors**: Multiple per screen, hiding items or enemies—can be opened/closed by player

### Enemy types and AI behavior

| Enemy | Behavior | Appearance |
|-------|----------|------------|
| **Hotel Inspector** | Pursues player from game start | Initial antagonist |
| **Hotel Manager** | Active patrol, uses elevators | Initial antagonist |
| **Bar Patron** | Joins pursuit, uses elevators | Initial antagonist |
| **Mr. Angry** | Sleeps behind a door; wakes when opened; relentless pursuit | Triggered enemy |
| **Chef** | Appears after Level 10 | Later difficulty |
| **Security Guard** | Appears after Level 10 | Later difficulty |

Enemy AI characteristics:
- Enemies **actively pursue** the player with path-finding
- They are **smart enough to use elevators** and stairs
- They **can catch you while riding elevators**
- They **cannot use conveyor belts** (exploit on screens 9-10)
- Number of active enemies increases with difficulty level

### Controls and player movement

The original uses **joystick-based controls** mapped to:
- **Directional movement**: Left/right walking, up/down for elevators/stairs
- **Action button**: Open/close doors, pick up items, take photograph
- **RESTORE key**: Pause/freeze game

Movement constraints:
- Player can walk, climb stairs, and ride elevators
- **Falling from any height (including one step) is fatal**
- No jump mechanic in traditional sense—vertical movement via stairs/elevators only

### Scoring system

Based on the GBC remake (likely faithful to original):
- **Key collected**: −3 points
- **Bulb collected**: −5 points  
- **Photograph taken**: −8 points
- **Time bonus**: +1 point per remaining time unit

### Win/lose conditions

- **Win**: Collect all 4 items and photograph Polly Platinum before time expires
- **Lose**: Contact with any enemy, falling from stairs, or time expiration costs a life
- **Game Over**: All lives depleted

---

## Technical specifications for authentic recreation

### Display and resolution

| Specification | C64 Original | Recommended Web |
|--------------|--------------|-----------------|
| Resolution | 320×200 pixels | 320×200 (scaled 3-4×) |
| Aspect ratio | ~1.2:1 (PAL squashed) | Use integer scaling |
| Refresh rate | 50Hz (PAL) / 60Hz (NTSC) | 60 FPS target |
| Border area | Visible colored border | Optional aesthetic |

### Sprite specifications

C64 hardware sprites:
- **Standard size**: 24×21 pixels (high-resolution) or 12×21 pixels (multicolor mode)
- **Maximum on screen**: 8 hardware sprites (multiplexing for more)
- **Colors per sprite**: 1 individual color + transparent (hi-res) or 3 colors + transparent (multicolor)
- **Animation frames**: Typically 2-4 frames for simple objects, 4-8 for characters

For Mr. Angry recreation, expect:
- Player sprite: ~24×21 pixels, 4-frame walk cycle
- Enemy sprites: Similar size, 2-4 animation frames each
- Item sprites: 16×16 or smaller, static or 2-frame animation

### The authentic C64 16-color palette

```css
:root {
  --c64-black: #000000;
  --c64-white: #FFFFFF;
  --c64-red: #68372B;
  --c64-cyan: #70A4B2;
  --c64-purple: #6F3D86;
  --c64-green: #588D43;
  --c64-blue: #352879;
  --c64-yellow: #B8C76F;
  --c64-orange: #6F4F25;
  --c64-brown: #433900;
  --c64-light-red: #9A6759;
  --c64-dark-gray: #444444;
  --c64-medium-gray: #6C6C6C;
  --c64-light-green: #9AD284;
  --c64-light-blue: #6C5EB5;
  --c64-light-gray: #959595;
}
```

This is the "Pepto" palette, considered the most accurate reproduction of actual C64 colors.

### Tile and level construction

C64 games typically used:
- **Character mode**: 40×25 grid of 8×8 pixel tiles
- **Metatiles**: 2×2 or 4×4 character blocks for larger objects
- **Screen RAM**: 1000 bytes for tile indices
- **Color RAM**: Per-character color data

For web recreation: Use **8×8 or 16×16 pixel tiles** in a tilemap system.

---

## Audio design

### Original game audio

Mr. Angry has **no in-game music**—only functional sound effects. Reviewer notes: "No in-game music to add to the freneticism of later levels and just a few functional SFX."

Expected sound effects to recreate:
- Door open/close
- Item pickup
- Enemy alert/wake (Mr. Angry)
- Player caught/death
- Level complete (photograph taken)
- Timer warning
- Elevator/movement sounds

### SID chip characteristics

The C64's SID chip offers:
- **3 independent voices** with selectable waveforms (triangle, sawtooth, pulse, noise)
- **ADSR envelopes** per voice
- **12dB/octave multimode filter**
- Characteristic "warm" distorted sound (6581 chip)

### Web audio solutions for SID-like sound

- **ZzFX**: Tiny (~1KB) procedural sound generator—ideal for retro SFX
- **jsSID**: Plays actual .SID files from the High Voltage SID Collection
- **Web Audio API**: Direct oscillator/filter control for custom SID-like synthesis

Example ZzFX integration:
```javascript
// Item pickup sound
zzfx(...[.5,,200,.01,.05,.1,1,2,,,,,,1]);
// Door sound  
zzfx(...[.3,,80,.02,.1,.15,1,0,,,,,,,,.1]);
```

---

## Visual references and resources

### Screenshots and playable versions

| Source | Content | URL |
|--------|---------|-----|
| Internet Archive | 6 screenshots + playable emulator | archive.org/details/d64_Mr._Angry_1986_Codemasters |
| C64 Online | Browser-playable with CRT effect | c64online.com/c64-games/mr-angry/ |
| Lemon64 | Screenshots, downloads, reviews | lemon64.com/game/mr-angry |
| Codemasters Archive | Box art, title screen, in-game shots | thecodemastersarchive.co.uk/games/mr-angry/ |

### Existing remake

A **Game Boy Color remake** by László Rajcsányi (WLS) exists:
- **Playable in browser**: Available on itch.io
- **Features**: 3 difficulty levels, 7 levels per difficulty (21 total)
- **Downloads**: .gbc ROM and .cia (3DS) files available
- **Source**: lacoste42.itch.io/mr-angry

This GBC version preserves core mechanics and can serve as gameplay reference.

### ROM and disk images

- **.d64 disk image**: Available from Internet Archive and Lemon64
- **File size**: ~40KB
- **Playable in**: VICE emulator, browser emulators, C64 Forever

---

## Framework recommendation: Phaser 3

### Why Phaser 3 wins

For a C64-style single-screen platformer, **Phaser 3** provides the optimal balance of features:

| Requirement | Phaser 3 Capability |
|-------------|---------------------|
| Pixel-perfect rendering | Built-in `pixelArt: true` config |
| Integer scaling | Scale Manager with zoom |
| Tilemap support | Excellent Tiled editor integration |
| Collision detection | Arcade physics—simple AABB |
| Animation system | Frame-based sprite animations |
| Audio | Web Audio API + ZzFX compatible |
| Community/docs | 37.8k GitHub stars, 1800+ examples |

### Recommended Phaser 3 configuration

```javascript
const config = {
  type: Phaser.AUTO,
  width: 320,   // C64 native width
  height: 200,  // C64 native height
  pixelArt: true,  // Disables anti-aliasing
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: 3  // Integer scaling for crisp pixels
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // No gravity—controlled movement
      debug: false
    }
  },
  scene: { preload, create, update }
};
```

### Alternative: LittleJS

For minimal footprint (~7KB), **LittleJS** offers:
- Built-in ZzFX integration
- Shader support for CRT effects
- Tiled map loading
- Simple built-in physics

Best for game jam or size-constrained deployment.

---

## Implementation approach for Claude Code agent

### Recommended project structure

```
mr-angry-web/
├── index.html
├── src/
│   ├── main.js          # Phaser config and boot
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── MenuScene.js
│   │   └── GameScene.js
│   ├── entities/
│   │   ├── Player.js
│   │   ├── Enemy.js
│   │   └── Item.js
│   ├── systems/
│   │   ├── EnemyAI.js
│   │   └── DoorManager.js
│   └── audio/
│       └── SoundManager.js
├── assets/
│   ├── sprites/
│   ├── tilemaps/
│   └── audio/
└── package.json
```

### Key implementation priorities

1. **Single-screen tilemap**: 40×25 tiles (320×200 pixels) representing one hotel floor
2. **Player controller**: 4-directional movement, door interaction, item pickup
3. **Enemy AI system**: Path-finding toward player, elevator/stair navigation
4. **Door system**: Openable doors with random item/enemy placement
5. **Inventory system**: Track 4 required items
6. **Collision system**: Player-enemy, player-item, player-door interactions
7. **Timer system**: Countdown with life penalty on expiration
8. **State machine**: Menu → Playing → Win/Lose → Next Level

### Sprite requirements (to create)

| Sprite | Size | Frames | Notes |
|--------|------|--------|-------|
| Player (photographer) | 24×21 | 4-8 | Walk cycle, idle |
| Hotel Inspector | 24×21 | 2-4 | Walk/chase animation |
| Hotel Manager | 24×21 | 2-4 | Distinguished appearance |
| Bar Patron | 24×21 | 2-4 | Casual clothes |
| Mr. Angry | 24×21 | 2-4 | Angry expression |
| Polly Platinum | 24×21 | 2 | Posing animation |
| Door (closed) | 16×32 | 1 | Hotel room door |
| Door (open) | 16×32 | 1 | Reveals interior |
| Camera | 16×16 | 1-2 | Item pickup |
| Key | 16×16 | 1-2 | Item pickup |
| Pass | 16×16 | 1 | Item pickup |
| Lightbulb | 16×16 | 1-2 | Item pickup |
| Elevator | 32×48 | 2-4 | Opening/closing |
| Conveyor belt | 32×8 | 2-4 | Animated movement |

### Level design considerations

For a single-level spiritual successor:
- Design a **multi-floor hotel layout** (suggest 3-5 floors for single level)
- Include **8-12 doors** with randomized item/enemy placement
- Add **2 elevators** connecting all floors
- Include **stairs** between adjacent floors
- Add **conveyor belt section** for strategic gameplay
- Place **goal door** (model's room) at consistent location

---

## Key sources for reference

- **Play original online**: c64online.com/c64-games/mr-angry/
- **Download .d64 image**: archive.org/details/d64_Mr._Angry_1986_Codemasters
- **Screenshots**: 6 JPEGs available at Internet Archive listing
- **GBC remake (playable)**: lacoste42.itch.io/mr-angry
- **Reviews/community**: lemon64.com/game/stringer (983+ comments)
- **Phaser 3 documentation**: phaser.io/phaser3
- **ZzFX sound generator**: killedbyapixel.github.io/ZzFX/
- **C64 palette reference**: Pepto palette (hex values listed above)

This briefing provides comprehensive technical and design specifications to begin building an authentic web-based spiritual successor to Mr. Angry. The recommended approach uses Phaser 3 with the C64 palette, 320×200 base resolution scaled 3×, tilemap-based level design, simple arcade physics, and ZzFX for retro audio.