import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
    this.seeded = false;
    this.seedType = 'numbers';
    this.mode = 'infinite';
  }

  create() {
    const { width, height } = this.scale;

    // Title
    this.add.text(width/2, height*0.15, 'Voidwalker', {
      font: '64px Arial', fill: '#fff',
      stroke: '#000', strokeThickness: 8
    }).setOrigin(0.5);

    // Mode buttons
    const modes  = ['infinite','chase','boss','hardboss'];
    const labels = ['Infinite','Chase','Boss','Hard Boss'];
    this.modeText = {};

    modes.forEach((key, i) => {
      const x = width/2 + (i - 1.5) * 120;
      this.modeText[key] = this.add.text(x, height*0.3, labels[i], {
        font: '24px Arial',
        fill: key === this.mode ? '#ffff00' : '#ffffff',
        stroke: '#000', strokeThickness: 2
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.mode = key;
        modes.forEach(m2 => {
          this.modeText[m2].setFill(m2 === key ? '#ffff00' : '#ffffff');
        });
      });
    });

    // Play button
    const play = this.add.image(width/2, height*0.45, 'play-button')
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);
    this.add.text(play.x, play.y, 'Play!', {
      font: '32px Arial', fill: '#fff',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);

    // Seeded-run UI
    const cb = this.add.image(width/2 - 160, height*0.6, 'checkbox-empty')
      .setInteractive({ useHandCursor: true });
    this.add.text(cb.x+40, cb.y, 'Seeded Run?', {
      font: '24px Arial', fill: '#fff',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0,0.5);

    const inputBox = this.add.image(width/2 + 40, cb.y, 'input-box')
      .setOrigin(0,0.5).setVisible(false);
    const inputText = this.add.text(inputBox.x+10, inputBox.y, '', {
      font: '24px monospace', fill: '#000'
    }).setOrigin(0,0.5).setVisible(false);
    const numText = this.add.text(width/2 - 60, height*0.7, 'Numbers', {
      font: '20px Arial', fill: '#ffff00',
      stroke: '#000', strokeThickness: 2
    }).setInteractive({ useHandCursor: true }).setVisible(false);
    const letText = this.add.text(width/2 + 20, height*0.7, 'Letters', {
      font: '20px Arial', fill: '#fff',
      stroke: '#000', strokeThickness: 2
    }).setInteractive({ useHandCursor: true }).setVisible(false);

    cb.on('pointerdown', () => {
      this.seeded = !this.seeded;
      cb.setTexture(this.seeded ? 'checkbox-checked' : 'checkbox-empty');
      [inputBox,inputText,numText,letText].forEach(o => o.setVisible(this.seeded));
    });
    numText.on('pointerdown', () => {
      this.seedType = 'numbers';
      numText.setFill('#ffff00');
      letText.setFill('#ffffff');
      inputText.text = '';
    });
    letText.on('pointerdown', () => {
      this.seedType = 'letters';
      letText.setFill('#ffff00');
      numText.setFill('#ffffff');
      inputText.text = '';
    });
    this.input.keyboard.on('keydown', evt => {
      if (!this.seeded) return;
      if (evt.key === 'Backspace') inputText.text = inputText.text.slice(0,-1);
      else if (evt.key.length === 1 && inputText.text.length < 12) {
        if (this.seedType === 'numbers' && /[0-9]/.test(evt.key))
          inputText.text += evt.key;
        if (this.seedType === 'letters' && /[a-zA-Z]/.test(evt.key))
          inputText.text += evt.key.toUpperCase();
      }
    });

    // Play handler
    play.on('pointerdown', () => {
      let seed;
      if (this.seeded && inputText.text) seed = inputText.text;
      else if (this.seedType === 'numbers')
        seed = Phaser.Math.Between(10000000,99999999).toString();
      else
        seed = Array.from({length:8},()=>Phaser.Math.RND.pick('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).join('');
      this.scene.start('Game', { seed, mode: this.mode });
    });
  }
}
