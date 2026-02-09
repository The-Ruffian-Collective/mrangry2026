import Phaser from 'phaser';
import { GAME } from '../constants/game.js';
import { C64_PALETTE, C64_PALETTE_HEX } from '../constants/palette.js';

/**
 * HUD - Heads Up Display
 *
 * Manages all UI elements: lives, inventory, timer, score, and status messages.
 * Designed with C64 aesthetic in mind.
 */
export class HUD {
  constructor(scene) {
    this.scene = scene;

    // References to UI elements
    this.elements = {};

    // Timer flash state
    this.timerFlashOn = false;
    this.timerFlashTimer = 0;

    // Create all UI elements
    this.create();
  }

  /**
   * Create all HUD elements
   */
  create() {
    // Lives display (top-left) - heart symbols
    this.elements.livesText = this.scene.add.text(8, 4, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: C64_PALETTE_HEX.RED
    }).setDepth(GAME.LAYER_HUD);

    // Timer display (top-center)
    this.elements.timerText = this.scene.add.text(GAME.WIDTH / 2, 4, '2:00', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: C64_PALETTE_HEX.WHITE
    }).setOrigin(0.5, 0).setDepth(GAME.LAYER_HUD);

    // Score display (top-right area, left of floor)
    this.elements.scoreText = this.scene.add.text(GAME.WIDTH - 50, 4, '000000', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: C64_PALETTE_HEX.YELLOW
    }).setOrigin(0.5, 0).setDepth(GAME.LAYER_HUD);

    // Floor indicator (top-right)
    this.elements.floorText = this.scene.add.text(GAME.WIDTH - 8, 4, 'F0', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: C64_PALETTE_HEX.LIGHT_GREEN
    }).setOrigin(1, 0).setDepth(GAME.LAYER_HUD);

    // Inventory display - item icons at bottom left
    this.elements.inventoryIcons = {};
    const itemTypes = ['pass', 'key', 'camera', 'bulb'];
    const startX = 8;
    const iconY = GAME.HEIGHT - 20;

    itemTypes.forEach((type, index) => {
      const icon = this.scene.add.sprite(startX + index * 20, iconY, 'items', index);
      icon.setDepth(GAME.LAYER_HUD);
      icon.setAlpha(0.3); // Dim until collected
      this.elements.inventoryIcons[type] = icon;
    });

    // Mute indicator (bottom-right)
    this.elements.muteText = this.scene.add.text(GAME.WIDTH - 8, GAME.HEIGHT - 8, '', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: C64_PALETTE_HEX.DARK_GRAY
    }).setOrigin(1, 1).setDepth(GAME.LAYER_HUD);

    // Control hints (bottom-center)
    this.elements.hintsText = this.scene.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 8, 'ARROWS/WASD: Move  SPACE: Action', {
      fontSize: '5px',
      fontFamily: 'monospace',
      color: C64_PALETTE_HEX.DARK_GRAY
    }).setOrigin(0.5, 1).setDepth(GAME.LAYER_HUD);

    // Status message (center) - for win/important messages
    this.elements.statusText = this.scene.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: C64_PALETTE_HEX.YELLOW
    }).setOrigin(0.5).setDepth(GAME.LAYER_HUD + 1).setVisible(false);

    // Item needed indicator (shows when trying to open Polly's door without items)
    this.elements.itemNeededText = this.scene.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2 + 20, '', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: C64_PALETTE_HEX.RED
    }).setOrigin(0.5).setDepth(GAME.LAYER_HUD + 1).setVisible(false);
  }

  /**
   * Update all HUD elements
   */
  update(player, timerSystem, soundManager) {
    if (!player) return;

    // Update lives
    this.updateLives(player.state.lives);

    // Update score
    this.updateScore(player.score);

    // Update floor
    this.updateFloor(player.state.currentFloor);

    // Update inventory
    this.updateInventory(player.state.inventory);

    // Update timer
    if (timerSystem) {
      this.updateTimer(timerSystem);
    }

    // Update mute indicator
    if (soundManager) {
      this.updateMuteIndicator(soundManager.isMuted());
    }
  }

  /**
   * Update lives display
   */
  updateLives(lives) {
    const hearts = '\u2665'.repeat(Math.max(0, lives));
    this.elements.livesText.setText(hearts);
  }

  /**
   * Update score display
   */
  updateScore(score) {
    this.elements.scoreText.setText(score.toString().padStart(6, '0'));
  }

  /**
   * Update floor indicator
   */
  updateFloor(floor) {
    this.elements.floorText.setText(`F${floor}`);
  }

  /**
   * Update inventory icons
   */
  updateInventory(inventory) {
    const icons = this.elements.inventoryIcons;

    if (icons.pass) {
      icons.pass.setAlpha(inventory.pass ? 1 : 0.3);
      if (inventory.pass) icons.pass.setTint(C64_PALETTE.WHITE);
    }
    if (icons.key) {
      icons.key.setAlpha(inventory.key ? 1 : 0.3);
      if (inventory.key) icons.key.setTint(C64_PALETTE.YELLOW);
    }
    if (icons.camera) {
      icons.camera.setAlpha(inventory.camera ? 1 : 0.3);
      if (inventory.camera) icons.camera.clearTint();
    }
    if (icons.bulb) {
      icons.bulb.setAlpha(inventory.bulb ? 1 : 0.3);
      if (inventory.bulb) icons.bulb.setTint(C64_PALETTE.YELLOW);
    }
  }

  /**
   * Update timer display
   */
  updateTimer(timerSystem) {
    const timeText = timerSystem.getFormattedTime();
    this.elements.timerText.setText(timeText);

    // Flash timer when in warning state
    if (timerSystem.isWarning()) {
      this.timerFlashTimer += 16; // Approximate delta
      if (this.timerFlashTimer > 250) {
        this.timerFlashTimer = 0;
        this.timerFlashOn = !this.timerFlashOn;
      }
      this.elements.timerText.setColor(
        this.timerFlashOn ? C64_PALETTE_HEX.RED : C64_PALETTE_HEX.YELLOW
      );
    } else {
      this.elements.timerText.setColor(C64_PALETTE_HEX.WHITE);
      this.timerFlashOn = false;
      this.timerFlashTimer = 0;
    }
  }

  /**
   * Update mute indicator
   */
  updateMuteIndicator(muted) {
    this.elements.muteText.setText(muted ? 'MUTED' : '');
  }

  /**
   * Show a status message (centered)
   */
  showStatus(message, duration = 2000) {
    this.elements.statusText.setText(message);
    this.elements.statusText.setVisible(true);

    // Auto-hide after duration
    if (duration > 0) {
      this.scene.time.delayedCall(duration, () => {
        this.elements.statusText.setVisible(false);
      });
    }
  }

  /**
   * Show "need items" message
   */
  showNeedItems(count) {
    const needed = 4 - count;
    this.elements.itemNeededText.setText(`NEED ${needed} MORE ITEM${needed > 1 ? 'S' : ''}`);
    this.elements.itemNeededText.setVisible(true);

    this.scene.time.delayedCall(1500, () => {
      this.elements.itemNeededText.setVisible(false);
    });
  }

  /**
   * Show "all items collected" message
   */
  showAllItemsCollected() {
    this.showStatus('ALL ITEMS COLLECTED!', 2000);

    // Flash all inventory icons
    const icons = Object.values(this.elements.inventoryIcons);
    this.scene.tweens.add({
      targets: icons,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: 3
    });
  }

  /**
   * Show win message
   */
  showWinMessage() {
    this.elements.statusText.setText('SCOOP!');
    this.elements.statusText.setVisible(true);
    this.elements.statusText.setColor(C64_PALETTE_HEX.LIGHT_GREEN);

    // Animate the text
    this.scene.tweens.add({
      targets: this.elements.statusText,
      scale: 1.5,
      duration: 500,
      yoyo: true,
      ease: 'Bounce.easeOut'
    });
  }

  /**
   * Hide status message
   */
  hideStatus() {
    this.elements.statusText.setVisible(false);
    this.elements.itemNeededText.setVisible(false);
  }

  /**
   * Destroy all HUD elements
   */
  destroy() {
    Object.values(this.elements).forEach(element => {
      if (element && element.destroy) {
        element.destroy();
      }
    });

    Object.values(this.elements.inventoryIcons).forEach(icon => {
      if (icon && icon.destroy) {
        icon.destroy();
      }
    });
  }
}
