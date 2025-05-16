import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import TitleScene from './TitleScene.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() { super('Preload'); }

  create() {
    const gfx = this.add.graphics();

    // Platform
    gfx.fillStyle(0x228b22, 1).fillRect(0, 0, 128, 32);
    gfx.lineStyle(4, 0x005500).strokeRect(0, 0, 128, 32);
    gfx.generateTexture('platform', 128, 32);
    gfx.clear();

    // Player
    gfx.fillStyle(0xaa0000, 1).fillCircle(16, 16, 16);
    gfx.fillStyle(0xffffff, 1).fillCircle(11,12,4).fillCircle(21,12,4);
    gfx.fillStyle(0x000000, 1).fillCircle(11,12,2).fillCircle(21,12,2);
    gfx.lineStyle(2,0x000000).beginPath()
       .arc(16,20,8, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160)).strokePath();
    gfx.generateTexture('player', 32, 32);
    gfx.clear();

    // Chaser
    gfx.fillStyle(0x0000aa, 1).fillCircle(16,16,16);
    gfx.fillStyle(0xffffff,1).fillCircle(11,12,4).fillCircle(21,12,4);
    gfx.fillStyle(0x000000,1).fillCircle(11,12,2).fillCircle(21,12,2);
    gfx.lineStyle(2,0x000000).beginPath()
       .arc(16,24,6, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), true).strokePath();
    gfx.generateTexture('chaser', 32, 32);
    gfx.clear();

    // Boss (cloud with sad face)
    gfx.fillStyle(0xffffff, 1);
    gfx.fillEllipse(64,20,100,40);
    gfx.fillEllipse(50,20,60,30);
    gfx.fillEllipse(80,20,60,30);
    gfx.fillStyle(0x000000,1).fillCircle(54,18,4).fillCircle(74,18,4);
    gfx.lineStyle(2,0x000000).beginPath()
       .arc(64,28,8, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340)).strokePath();
    gfx.generateTexture('boss', 128, 64);
    gfx.clear();

    // Spears (Undyne style)
    // body + triangular tip
    gfx.fillStyle(0x0000ff, 1);
    gfx.beginPath();
    gfx.moveTo(0, 3);
    gfx.lineTo(24, 3);
    gfx.lineTo(24, 0);
    gfx.lineTo(32, 6);
    gfx.lineTo(24, 12);
    gfx.lineTo(24, 9);
    gfx.lineTo(0, 9);
    gfx.closePath();
    gfx.fillPath();
    gfx.lineStyle(2, 0x000088);
    gfx.strokePath();
    gfx.generateTexture('spear', 32, 12);
    gfx.clear();

    // UI (checkbox, input, button) — unchanged
    // ...
    gfx.fillStyle(0xffffff,1).fillRect(0,0,32,32);
    gfx.lineStyle(2,0x000000).strokeRect(0,0,32,32);
    gfx.generateTexture('checkbox-empty',32,32); gfx.clear();
    gfx.fillStyle(0xffffff,1).fillRect(0,0,32,32);
    gfx.lineStyle(2,0x000000).strokeRect(0,0,32,32);
    gfx.lineStyle(4,0x0044cc).beginPath()
       .moveTo(8,16).lineTo(14,24).lineTo(24,8).strokePath();
    gfx.generateTexture('checkbox-checked',32,32); gfx.clear();
    gfx.fillStyle(0xffffff,1).fillRect(0,0,200,40);
    gfx.lineStyle(4,0x000000).strokeRect(0,0,200,40);
    gfx.generateTexture('input-box',200,40); gfx.clear();
    gfx.fillStyle(0x0044cc,1).fillRoundedRect(0,0,200,60,10);
    gfx.lineStyle(4,0xffffff).strokeRoundedRect(0,0,200,60,10);
    gfx.generateTexture('play-button',200,60);

    gfx.destroy();
    this.scene.start('Title');
  }
}
