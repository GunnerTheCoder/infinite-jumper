import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
    this.seeded = false;
    this.seedType = 'numbers'; // default type
  }

  create() {
    const { width, height } = this.scale;

    // Title
    this.add.text(width/2, height*0.2, 'Voidwalker', {
      font: '64px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Play button
    const play = this.add.image(width/2, height*0.4, 'play-button')
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);
    this.add.text(play.x, play.y, 'Play!', {
      font: '32px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Seeded Run checkbox + label
    const cb = this.add.image(width/2 - 160, height*0.55, 'checkbox-empty')
      .setInteractive({ useHandCursor: true });
    this.add.text(cb.x + 40, cb.y, 'Seeded Run?', {
      font: '24px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    // Input box & text (hidden until checked)
    const inputBox = this.add.image(width/2 + 40, height*0.55, 'input-box')
      .setOrigin(0, 0.5)
      .setVisible(false);
    const inputText = this.add.text(inputBox.x + 10, inputBox.y, '', {
      font: '24px monospace',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5).setVisible(false);

    // Seed-type toggles (hidden until checked)
    const numText = this.add.text(width/2 - 60, height*0.65, 'Numbers', {
      font: '20px Arial',
      fill: '#ffff00', // highlighted by default
      stroke: '#000000',
      strokeThickness: 2
    }).setInteractive({ useHandCursor: true }).setOrigin(0,0.5).setVisible(false);
    const letText = this.add.text(width/2 + 20, height*0.65, 'Letters', {
      font: '20px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setInteractive({ useHandCursor: true }).setOrigin(0,0.5).setVisible(false);

    // Toggle checkbox
    cb.on('pointerdown', () => {
      this.seeded = !this.seeded;
      cb.setTexture(this.seeded ? 'checkbox-checked' : 'checkbox-empty');
      inputBox.setVisible(this.seeded);
      inputText.setVisible(this.seeded);
      numText.setVisible(this.seeded);
      letText.setVisible(this.seeded);
    });

    // Choose numbers
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

    // Typing input (enforce type)
    this.input.keyboard.on('keydown', evt => {
      if (!this.seeded) return;
      if (evt.key === 'Backspace') {
        inputText.text = inputText.text.slice(0, -1);
      } else if (evt.key.length === 1 && inputText.text.length < 12) {
        if (this.seedType === 'numbers' && /[0-9]/.test(evt.key)) {
          inputText.text += evt.key;
        }
        if (this.seedType === 'letters' && /[a-zA-Z]/.test(evt.key)) {
          inputText.text += evt.key.toUpperCase();
        }
      }
    });

    // Play button handler: always generate numeric or alphabetic seed
    play.on('pointerdown', () => {
      let seed;
      const custom = inputText.text;
      if (this.seeded && custom.length > 0) {
        seed = custom;
      } else {
        if (this.seedType === 'numbers') {
          seed = Phaser.Math.Between(10000000, 99999999).toString();
        } else {
          seed = Array.from({ length: 8 }, () =>
            Phaser.Math.RND.pick('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
          ).join('');
        }
      }
      this.scene.start('Game', { seed });
    });
  }
}
