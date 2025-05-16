import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import GameScene from './GameScene.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }
  preload() {
    // e.g. this.load.image('player', '../assets/images/player.png');
  }
  create() {
    this.scene.start('Game');
  }
}
