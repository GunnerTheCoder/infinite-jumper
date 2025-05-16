import Phaser from 'phaser';
import PreloadScene from './PreloadScene.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }
  preload() {
    // immediately go to Preload
    this.scene.start('Preload');
  }
}
