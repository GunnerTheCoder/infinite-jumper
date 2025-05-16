import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1000 } }
  },
  scene: [BootScene]
};

new Phaser.Game(config);
