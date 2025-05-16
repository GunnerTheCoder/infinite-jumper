import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import GameScene from './GameScene.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    // nothing to load from disk…
  }

  create() {
    // ▸ Generate a green platform texture (128×32)
    const gfx = this.add.graphics();
    gfx.fillStyle(0x00aa00, 1);
    gfx.fillRect(0, 0, 128, 32);
    gfx.generateTexture('platform', 128, 32);
    gfx.clear();

    // ▸ Generate a red player texture (32×48)
    gfx.fillStyle(0xaa0000, 1);
    gfx.fillRect(0, 0, 32, 48);
    gfx.generateTexture('player', 32, 48);
    gfx.destroy();

    // Move on to the Game scene
    this.scene.start('Game');
  }
}
