import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import GameScene from './GameScene.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() { super('Preload'); }

  preload() {
    // Load Phaser’s logo from the official examples CDN
    this.load.image('logo', 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');
  }

  create() {
    // Go to the main game scene once loading is done
    this.scene.start('Game');
  }
}
