import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

export const CONFIG = {
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
    zoom: 3,
    min: { width: 320, height: 200 },
    max: { width: 1280, height: 800 }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
      tileBias: 8
    }
  },
  input: {
    activePointers: 2
  },
  audio: {
    disableWebAudio: false
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene]
};
