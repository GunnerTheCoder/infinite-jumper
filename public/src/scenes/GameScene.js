import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    // Draw the logo at the center of the canvas
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, 'logo');
  }

  update() {
    // nothing yet
  }
}
