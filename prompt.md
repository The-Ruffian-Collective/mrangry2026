# Mr. Angry 2026 Recreation - Claude Code Initial Prompt

Copy and paste this entire prompt to your Claude Code agent to begin the project.

---

## Project Overview

You are building a web-based spiritual successor to the classic 1985 Commodore 64 game "Mr. Angry" (originally titled "Stringer"). This is a single-screen platformer where a freelance photographer navigates a multi-floor hotel, collecting equipment while evading pursuing staff, to photograph a celebrity.

**Target:** Web (Phaser 3), single playable level
**Visual Style:** C64-inspired pixel art (320×200, 16-colour Pepto palette)
**Audio:** Retro chiptune SFX via ZzFX

---

## Setup Instructions

First, read the project documentation files in the `/docs` folder:

1. **prd.md** - Product Requirements Document (what to build)
2. **tdd.md** - Technical Design Document (how to build it)
3. **plan.md** - Implementation Plan (build order and phases)

These documents contain everything you need: game mechanics, technical architecture, data structures, code patterns, and a phased implementation plan.

---

## Begin Phase 1: Project Foundation & Phaser Setup

Your first task is to complete Phase 1, which establishes the working project structure.

### Tasks to Complete

1. Create the project directory structure as specified in plan.md
2. Create `package.json` with Phaser 3.60+ and Vite dependencies
3. Create `vite.config.js` for the dev server
4. Create `index.html` with game container and pixel-art CSS
5. Create `src/constants/palette.js` with all 16 C64 Pepto palette colours
6. Create `src/constants/game.js` with game constants
7. Create `src/config.js` with Phaser configuration (320×200, pixelArt: true, 3× scaling)
8. Create `src/main.js` to instantiate the Phaser game
9. Create stub scene files (BootScene, MenuScene, GameScene, GameOverScene)
10. BootScene should transition to MenuScene after a brief delay

### Verification Criteria

- `npm install` completes without errors
- `npm run dev` starts server at localhost:3000
- Browser shows centred 960×600 game area (320×200 scaled 3×)
- Background colour is C64 dark blue (#352879)
- No console errors
- Scene flow works: Boot → Menu

### Reference: C64 Pepto Palette (from tdd.md)

```javascript
const C64_PALETTE = {
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
```

### Reference: Phaser Config (from tdd.md)

```javascript
const config = {
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
    zoom: 3
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene]
};
```

---

## After Phase 1

Once Phase 1 is complete and verified, report back. Then we'll proceed to Phase 2 (placeholder graphics and menu screen) following the plan.md sequence.

The full project has 8 phases. Each builds on the previous, and the game should be testable after each phase.

---

## Key Points

- **Read the docs first** — PRD, TDD, and Plan contain all the details
- **Follow the phase order** — Dependencies are structured for incremental progress
- **Placeholder graphics are fine** — Focus on gameplay mechanics first
- **Test frequently** — Verify each task works before moving on
- **Use the TDD code examples** — They're designed to work together

Let's build Mr. Angry! Start with Phase 1.
