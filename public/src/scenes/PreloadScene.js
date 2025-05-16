import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import TitleScene from './TitleScene.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() { super('Preload'); }
  create() {
    const gfx = this.add.graphics();

    // Flat platform (128×32)
    gfx.fillStyle(0x228b22, 1);
    gfx.fillRect(0, 0, 128, 32);
    gfx.lineStyle(4, 0x005500);
    gfx.strokeRect(0, 0, 128, 32);
    gfx.generateTexture('platform-flat', 128, 32);
    gfx.clear();

    // Sloped platform (triangle 128×32)
    gfx.fillStyle(0x228b22, 1);
    gfx.beginPath();
    gfx.moveTo(0, 32);
    gfx.lineTo(128, 0);
    gfx.lineTo(128, 32);
    gfx.closePath();
    gfx.fillPath();
    gfx.lineStyle(4, 0x005500);
    gfx.strokeTriangle(0, 32, 128, 0, 128, 32);
    gfx.generateTexture('platform-slope', 128, 32);
    gfx.clear();

    // Player (32×32 circle with face)
    gfx.fillStyle(0xaa0000, 1).fillCircle(16,16,16);
    gfx.fillStyle(0xffffff,1).fillCircle(11,12,4).fillCircle(21,12,4);
    gfx.fillStyle(0x000000,1).fillCircle(11,12,2).fillCircle(21,12,2);
    gfx.lineStyle(2,0x000000).beginPath()
       .arc(16,20,8,Phaser.Math.DegToRad(20),Phaser.Math.DegToRad(160)).strokePath();
    gfx.generateTexture('player', 32, 32);
    gfx.clear();

    // Star pickup (24×24)
    gfx.fillStyle(0xFFFF00,1);
    const R = 10, Cx=12, Cy=12;
    gfx.beginPath();
    for(let i=0;i<5;i++){
      const a = Phaser.Math.DegToRad( i * 72 );
      const b = Phaser.Math.DegToRad( i * 72 + 36 );
      gfx.lineTo(Cx + Math.cos(a)*R, Cy + Math.sin(a)*R);
      gfx.lineTo(Cx + Math.cos(b)*(R/2), Cy + Math.sin(b)*(R/2));
    }
    gfx.closePath();
    gfx.fillPath();
    gfx.lineStyle(2,0x000000).strokePath();
    gfx.generateTexture('star', 24, 24);
    gfx.destroy();

    this.scene.start('Title');
  }
}
