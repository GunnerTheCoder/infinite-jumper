import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
    this.lastPlatformX = 0;
    this.lastSafeX = 0;
    this.lastSafeY = 0;
  }

  create() {
    // — World & camera bounds
    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 600);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 600);

    // — Create platform group
    this.platforms = this.physics.add.staticGroup();

    // — Initial platforms
    for (let x = 0; x < 800; x += 200) {
      const p = this.platforms.create(x, 550, 'platform').setOrigin(0);
      this.lastPlatformX = x;
    }

    // — Player
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // — Collider & "last safe" tracking
    this.physics.add.collider(this.player, this.platforms, (player, platform) => {
      this.lastSafeX = player.x;
      this.lastSafeY = player.y;
    });

    // — Camera follow
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // — Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.aKey = this.input.keyboard.addKey('A');
    this.dKey = this.input.keyboard.addKey('D');

    // Record initial safe spot
    this.lastSafeX = this.player.x;
    this.lastSafeY = this.player.y;
  }

  update() {
    // — Horizontal movement
    const speed = 200;
    if (this.cursors.left.isDown || this.aKey.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.dKey.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    // — Jump
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // — Spawn new platforms ahead
    const cameraRight = this.cameras.main.scrollX + 800;
    if (this.lastPlatformX < cameraRight) {
      const x = this.lastPlatformX + Phaser.Math.Between(150, 300);
      const y = Phaser.Math.Between(300, 550);
      const plat = this.platforms.create(x, y, 'platform').setOrigin(0);
      this.lastPlatformX = x;
      plat.refreshBody();
    }

    // — Void check & respawn
    const voidY = this.cameras.main.scrollY + 700;
    if (this.player.y > voidY) {
      this.player.setPosition(this.lastSafeX, this.lastSafeY - 50);
      this.player.setVelocity(0, 0);
    }
  }
}
