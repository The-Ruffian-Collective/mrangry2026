# Mr. Angry 2026 - Comprehensive Audit Report

**Date:** 2026-02-09
**Auditor:** Claude Opus 4.6
**Method:** Full source code review + live browser testing (Playwright/Puppeteer)

---

## Summary

All 8 implementation phases are structurally complete, but live testing revealed **3 critical bugs**, **4 major bugs**, **5 minor bugs**, and **2 missing features** that prevent the game from functioning as a playable MVP.

**Most critical finding:** Enemies never move (zero gameplay challenge) and the respawn flow is broken (timer/enemies/doors don't reset after death).

---

## CRITICAL BUGS (Game-Breaking)

### BUG-1: Enemies Never Move
- **Severity:** CRITICAL
- **Evidence:** Across 2+ minutes of observed gameplay, all 3 enemies remained completely static at spawn positions
- **Files:** `src/systems/EnemyAI.js`, `src/entities/Enemy.js`, `src/scenes/GameScene.js`
- **Root cause:** Needs runtime investigation. AI code looks correct on paper. Likely: collision layer blocking horizontal movement, enemy bodies overlapping floor tiles, or pathfinding waypoints never being set
- **Fix:** Add diagnostic logging to trace failure point, then fix root cause

### BUG-2: Timer Not Reset After Death
- **Severity:** CRITICAL
- **Evidence:** Timer expired at 0:00, player lost a life, but timer stayed frozen at 0:00 permanently
- **Files:** `src/entities/Player.js:473`, `src/systems/TimerSystem.js:56`, `src/scenes/GameScene.js`
- **Root cause:** `Player.respawn()` never calls `timerSystem.reset()` or `timerSystem.start()`. The methods exist but are never invoked
- **Fix:** Create coordinated respawn flow in GameScene

### BUG-3: Enemies Not Reset After Player Death
- **Severity:** HIGH
- **Files:** `src/scenes/GameScene.js`, `src/entities/Enemy.js:216`
- **Root cause:** `Enemy.reset()` exists but is never called during respawn
- **Fix:** Include in coordinated respawn flow

---

## MAJOR BUGS

### BUG-4: Door Items/Randomization Not Reset After Death
- **Files:** `src/systems/DoorManager.js:317`
- **Root cause:** `DoorManager.reset()` exists but never called during respawn

### BUG-5: No Respawn Flow Coordination (Root Cause of BUG-2/3/4)
- **Files:** `src/entities/Player.js:460-467`, `src/scenes/GameScene.js`
- **Root cause:** `Player.die()` only calls `this.respawn()` (player-only) or `this.scene.handleGameOver()`. No coordination with timer, enemies, doors, or Mr. Angry
- **Fix:** Create `handleRespawn()` in GameScene that resets all systems

### BUG-6: HUD Timer Flash Uses Hardcoded Delta
- **File:** `src/ui/HUD.js` - `updateTimer` method
- **Root cause:** `this.timerFlashTimer += 16` instead of actual frame delta

### BUG-7: Player Stair Movement Uses Hardcoded Frame Rate
- **File:** `src/entities/Player.js:280-287`
- **Root cause:** `(1 / 60)` instead of `delta / 1000`

---

## MINOR BUGS

### BUG-8: Missing favicon.ico (404 Error)
- Console: `Failed to load resource: 404 (Not Found)` for `/favicon.ico`

### BUG-9: Mr. Angry Walk Animation Never Stops
- **File:** `src/entities/MrAngry.js:126-128`
- No idle fallback when velocity becomes 0

### BUG-10: Elevator Platform Snap Conflicts with Stairs
- **File:** `src/systems/ElevatorSystem.js:142-143`
- `snapToFloor()` not guarded against stair state

### BUG-11: Multiple Death Sources Can Race
- Timer expiry, enemy collision, and stair fall can trigger `die()` in same frame
- Partially mitigated by `isDead` guard

### BUG-12: Invulnerability Not Checked on Timer Death
- **File:** `src/scenes/GameScene.js:106-110`
- Timer expiry doesn't check `player.isInvulnerable()` unlike enemy collision

---

## MISSING FEATURES

### FEAT-1: Touch Controls Not Implemented
- No `src/ui/TouchControls.js` exists
- Deferred for post-MVP (desktop-first)

### FEAT-2: Dev Mode 'G' Key Left In
- **File:** `src/scenes/GameScene.js:327-329`
- `keydown-G` triggers instant `handleGameOver()` - should be debug-only

---

## VISUAL OBSERVATIONS (Browser Testing)

1. Menu screen renders correctly with proper scaling
2. HUD elements (lives, timer, score, floor, inventory) all positioned correctly
3. Level layout matches tilemap data - 4 floors, doors, elevators, stairs visible
4. Character sprites render at correct sizes
5. Timer countdown works correctly from 2:00 to 0:00
6. Warning state triggers at 30s
7. Pixel art rendering is crisp, scaling works properly

---

## FILES REQUIRING MODIFICATION

| Priority | File | Changes Needed |
|----------|------|---------------|
| 1 | `src/scenes/GameScene.js` | Add `handleRespawn()`, fix respawn flow, guard G key |
| 2 | `src/entities/Player.js` | Wire `die()` to scene respawn, fix stair framerate |
| 3 | `src/systems/EnemyAI.js` | Debug & fix enemy movement |
| 4 | `src/ui/HUD.js` | Fix timer flash delta |
| 5 | `src/entities/MrAngry.js` | Add idle animation fallback |
| 6 | `src/systems/ElevatorSystem.js` | Guard snap against stair state |
| 7 | `index.html` | Add favicon suppression |

---

## EXISTING UTILITIES AVAILABLE FOR REUSE

| Method | File:Line | Purpose |
|--------|-----------|---------|
| `TimerSystem.reset()` | `src/systems/TimerSystem.js:56` | Resets timer to 120s |
| `TimerSystem.start()` | `src/systems/TimerSystem.js:27` | Starts countdown |
| `Enemy.reset()` | `src/entities/Enemy.js:216` | Resets enemy to spawn position |
| `DoorManager.reset()` | `src/systems/DoorManager.js:317` | Re-randomizes door contents |
| `Player.respawn()` | `src/entities/Player.js:473` | Resets player position/state |
| `Player.isInvulnerable()` | `src/entities/Player.js:432` | Checks invulnerability |
