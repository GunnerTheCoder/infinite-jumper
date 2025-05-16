import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import PreloadScene from './PreloadScene.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }
  preload() {
    this.scene.start('Preload');
  }
}
