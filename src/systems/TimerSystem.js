import { GAME } from '../constants/game.js';

/**
 * TimerSystem - Manages the level countdown timer
 *
 * Handles countdown from LEVEL_TIME (120s), warning at WARNING_TIME (30s),
 * and triggers death when timer expires.
 */
export class TimerSystem {
  constructor(scene) {
    this.scene = scene;
    this.timeRemaining = GAME.LEVEL_TIME;
    this.isRunning = false;
    this.isPaused = false;
    this.warningTriggered = false;
    this.warningFlashActive = false;

    // Callbacks
    this.onWarning = null;
    this.onExpire = null;
    this.onTick = null;
  }

  /**
   * Start the timer
   */
  start() {
    this.isRunning = true;
    this.isPaused = false;
  }

  /**
   * Pause the timer
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume the timer
   */
  resume() {
    this.isPaused = false;
  }

  /**
   * Stop the timer
   */
  stop() {
    this.isRunning = false;
  }

  /**
   * Reset the timer to initial state
   */
  reset() {
    this.timeRemaining = GAME.LEVEL_TIME;
    this.isRunning = false;
    this.isPaused = false;
    this.warningTriggered = false;
    this.warningFlashActive = false;
  }

  /**
   * Get formatted time string (MM:SS)
   */
  getFormattedTime() {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = Math.floor(this.timeRemaining % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get time remaining in seconds
   */
  getTimeRemaining() {
    return Math.floor(this.timeRemaining);
  }

  /**
   * Check if timer is in warning state
   */
  isWarning() {
    return this.timeRemaining <= GAME.WARNING_TIME && this.timeRemaining > 0;
  }

  /**
   * Check if timer has expired
   */
  hasExpired() {
    return this.timeRemaining <= 0;
  }

  /**
   * Update timer each frame
   */
  update(delta) {
    if (!this.isRunning || this.isPaused) {
      return;
    }

    // Decrease time
    this.timeRemaining -= delta / 1000;

    // Clamp to 0
    if (this.timeRemaining < 0) {
      this.timeRemaining = 0;
    }

    // Check for warning threshold
    if (!this.warningTriggered && this.timeRemaining <= GAME.WARNING_TIME) {
      this.warningTriggered = true;
      this.warningFlashActive = true;
      if (this.onWarning) {
        this.onWarning();
      }
    }

    // Check for expiration
    if (this.timeRemaining <= 0 && this.isRunning) {
      this.isRunning = false;
      if (this.onExpire) {
        this.onExpire();
      }
    }

    // Notify of tick (for HUD updates)
    if (this.onTick) {
      this.onTick(this.timeRemaining);
    }
  }

  /**
   * Add bonus time (e.g., from collecting items)
   */
  addTime(seconds) {
    this.timeRemaining += seconds;
    // Don't go over max
    if (this.timeRemaining > GAME.LEVEL_TIME) {
      this.timeRemaining = GAME.LEVEL_TIME;
    }
    // Reset warning if time is back above threshold
    if (this.timeRemaining > GAME.WARNING_TIME) {
      this.warningTriggered = false;
      this.warningFlashActive = false;
    }
  }
}
