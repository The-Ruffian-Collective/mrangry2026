// Game constants
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

  // Depth layers
  LAYER_BACKGROUND: 0,
  LAYER_TILES: 1,
  LAYER_ITEMS: 2,
  LAYER_ENEMIES: 3,
  LAYER_PLAYER: 4,
  LAYER_DOORS: 5,
  LAYER_HUD: 6,

  // Floor Y-positions (surface where characters stand)
  // Used for pathfinding and floor detection
  FLOORS: {
    0: 176,  // Bottom floor (ground level)
    1: 128,  // Floor 1
    2: 80,   // Floor 2
    3: 32    // Top floor (floor 3)
  },

  // Floor height (distance between floors)
  FLOOR_HEIGHT: 48,

  // Number of floors
  NUM_FLOORS: 4
};
