# Mr. Angry 2026

A web-based spiritual successor to the 1985 C64 game "Mr. Angry" (originally "Stringer").

![C64 Style](https://img.shields.io/badge/style-C64%20Retro-6F3D86)
![Phaser 3](https://img.shields.io/badge/Phaser-3.80+-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## About

You play as a freelance photographer sneaking through a multi-floor hotel, collecting equipment while evading pursuing staff, to photograph the elusive celebrity Polly Platinum.

### Features

- Authentic C64 aesthetic using the Pepto 16-color palette
- 320x200 pixel resolution scaled 3x for modern displays
- 4-floor hotel with elevators, stairs, and conveyor belts
- 4 enemies with pathfinding AI
- Procedural audio via ZzFX
- Keyboard and touch controls

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Then open http://localhost:3000 in your browser.

## Controls

| Action | Keyboard |
|--------|----------|
| Move | Arrow Keys / WASD |
| Action (Open Door / Photograph) | Space |
| Pause | P |
| Mute | M |
| Debug View | D |

## Gameplay

1. **Collect 4 items** hidden behind random doors:
   - Press Pass
   - Room Key
   - Camera
   - Flash Bulb

2. **Avoid the hotel staff:**
   - Hotel Inspector
   - Hotel Manager
   - Bar Patron
   - Mr. Angry (triggered when you open his door!)

3. **Navigate the hotel:**
   - Use elevators to travel between floors
   - Take the stairs (but don't fall!)
   - Conveyor belt on the top floor (enemies can't use it)

4. **Photograph Polly Platinum** once you have all items to win!

## Tech Stack

- **Framework:** [Phaser 3](https://phaser.io/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Audio:** [ZzFX](https://github.com/KilledByAPixel/ZzFX)
- **Resolution:** 320x200 @ 3x scale

## Project Structure

```
mr-angry-2026/
├── src/
│   ├── main.js           # Game entry point
│   ├── config.js         # Phaser configuration
│   ├── constants/        # Palette, game constants
│   ├── scenes/           # Boot, Menu, Game, GameOver
│   ├── entities/         # Player, Enemy, MrAngry
│   ├── systems/          # AI, Doors, Elevators, Timer
│   ├── audio/            # SoundManager (ZzFX)
│   └── ui/               # HUD
├── assets/
│   ├── sprites/          # Character & tile graphics
│   └── tilemaps/         # Level data (Tiled JSON)
└── docs/
    ├── prd.md            # Product requirements
    ├── tdd.md            # Technical design
    └── plan.md           # Implementation phases
```

## Development

This project was developed in 8 phases. See `docs/project-status.txt` for detailed history.

### Status: COMPLETE

- [x] Phase 1: Project Foundation & Phaser Setup
- [x] Phase 2: Placeholder Graphics & Menu Screen
- [x] Phase 3: Tilemap & Level Structure
- [x] Phase 4: Player Movement & Controls
- [x] Phase 5: Elevators & Stairs Navigation
- [x] Phase 6: Doors, Items & Mr. Angry
- [x] Phase 7: Enemy AI & Collisions
- [x] Phase 8: Win Condition, HUD & Audio

## Credits

- **Original Game:** "Mr. Angry" / "Stringer" (1985) by Steve Wiggins
- **Recreation:** Built with assistance from Claude (Anthropic)

## License

MIT License - See LICENSE file for details.
