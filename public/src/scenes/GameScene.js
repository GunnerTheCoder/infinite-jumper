import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class GameScene extends Phaser.Scene {
  init(data) {
    this.seed = data.seed;
    this.mode = data.mode || 'infinite';
    Phaser.Math.RND.sow([this.seed]);
    this.hearts = 3;
  }

  constructor() {
    super('Game');
    this.lastX = 0; this.lastY = 550;
    this.chaser = null;
    this.boss = null;
    this.spears = null;
    this.diveLine = null;
    this.bossDiveTimer = null;
    this.bossScreenX = null;
  }

  create() {
    // UI: seed & hearts
    this.add.text(780,10,`Seed: ${this.seed}`, {
      font:'20px Arial', fill:'#fff',
      stroke:'#000', strokeThickness:3
    }).setScrollFactor(0).setOrigin(1,0);
    this.heartsText = this.add.text(20,10,'❤️❤️❤️', {
      font:'20px Arial'
    }).setScrollFactor(0);

    // World & camera
    this.physics.world.setBounds(0,0,Number.MAX_SAFE_INTEGER,1000);
    this.cameras.main.setBounds(0,0,Number.MAX_SAFE_INTEGER,600);

    // Platforms
    this.platforms = this.physics.add.staticGroup();
    this.spawnPlatform(0,550);

    // Player
    this.player = this.physics.add.sprite(100,500,'player').setBounce(0.1);
    this.physics.add.collider(this.player,this.platforms);

    // Input & camera follow
    this.cursors = this.input.keyboard.createCursorKeys();
    this.aKey = this.input.keyboard.addKey('A');
    this.dKey = this.input.keyboard.addKey('D');
    this.cameras.main.startFollow(this.player,true,0.1,0.1);

    // Chase mode
    if (this.mode==='chase') {
      this.time.delayedCall(5000, ()=>{
        this.chaser = this.physics.add.sprite(100,500,'chaser').setBounce(0.1);
        this.physics.add.collider(this.chaser,this.platforms);
        this.physics.add.overlap(this.chaser,this.player, ()=> this.scene.start('Title'));
      });
    }

    // Boss mode
    if (this.mode==='boss') {
      // Spears group & overlap
      this.spears = this.physics.add.group({ allowGravity:false });
      this.physics.add.overlap(this.player,this.spears, (p,s) => {
        s.destroy();
        this.hearts--;
        this.heartsText.text = '❤️'.repeat(this.hearts);
        if (this.hearts<=0) this.scene.start('Title');
      });

      // Boss sprite (world-relative at start)
      this.boss = this.add.image(100,100,'boss')
        .setScale(1.5)
        .setScrollFactor(1);

      // Schedule the first dive
      this.scheduleBossDive();
    }
  }

  update() {
    const SPEED = 200, JUMP_Y = -450;

    // Player movement & hold-to-jump
    if (this.cursors.left.isDown || this.aKey.isDown) this.player.setVelocityX(-SPEED);
    else if (this.cursors.right.isDown || this.dKey.isDown) this.player.setVelocityX(SPEED);
    else this.player.setVelocityX(0);
    if (this.cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(JUMP_Y);
    }

    // Chaser AI
    if (this.chaser) {
      const dir = this.player.x > this.chaser.x ? 1 : -1;
      this.chaser.setVelocityX(dir * SPEED * 0.8);
      if (this.chaser.body.touching.down) this.chaser.setVelocityY(JUMP_Y);
    }

    // Boss follow or fixed
    if (this.boss) {
      if (this.bossScreenX == null) {
        // hover above player until after dive
        const cam = this.cameras.main;
        this.boss.x = this.player.x;
        this.boss.y = cam.scrollY + 80;
      } else {
        // stay at fixed screen position
        this.boss.setScrollFactor(0);
        this.boss.x = this.cameras.main.scrollX + this.bossScreenX;
      }
    }

    // Gentle homing for spears
    if (this.spears) {
      this.spears.getChildren().forEach(spear => {
        const toPlayer = new Phaser.Math.Vector2(
          this.player.x - spear.x,
          this.player.y - spear.y
        ).normalize().scale(20);
        spear.body.velocity.add(toPlayer);
      });
    }

    // Spawn new platforms
    const camR = this.cameras.main.scrollX + 800;
    if (this.lastX < camR) {
      const newY = Phaser.Math.Clamp(
        this.lastY + Phaser.Math.Between(-100,100),
        300,550
      );
      this.spawnPlatform(this.lastX + Phaser.Math.Between(100,220), newY);
    }

    // Void check & teleport 30px above center
    const voidY = this.cameras.main.scrollY + 700;
    if (this.player.y > voidY) {
      this.teleportAboveNearest(this.player, 30);
    }
    if (this.chaser && this.chaser.y > voidY) {
      this.teleportAboveNearest(this.chaser, 0);
    }
  }

  spawnPlatform(x,y) {
    const p = this.platforms.create(x,y,'platform').setOrigin(0);
    p.refreshBody();
    this.lastX = x; this.lastY = y;
  }

  teleportAboveNearest(sprite, offsetY=0) {
    let best=null, md=Infinity;
    this.platforms.getChildren().forEach(p => {
      const cx = p.x + p.displayWidth/2;
      const d  = Math.abs(sprite.x - cx);
      if (d < md) { md = d; best = p; }
    });
    if (best) {
      sprite.setPosition(
        best.x + best.displayWidth/2,
        best.y - sprite.displayHeight/2 - offsetY
      );
      if (sprite.body) sprite.setVelocity(0);
    }
  }

  scheduleBossDive() {
    // Random delay 10–15 s
    const delay = Phaser.Math.Between(10000,15000);
    this.bossDiveTimer = this.time.delayedCall(delay, () => {
      this.startBossDive();
    });
  }

  startBossDive() {
    // Determine dive X in world coords
    const diveX = this.player.x;
    // Draw dotted guide line (world-relative)
    const cam = this.cameras.main;
    const startY = cam.scrollY;
    const endY   = cam.scrollY + cam.height;
    const lineG = this.add.graphics().setScrollFactor(1).setDepth(10);
    lineG.lineStyle(2, 0xff0000);
    for (let y = startY; y < endY; y += 16) {
      lineG.moveTo(diveX, y);
      lineG.lineTo(diveX, y + 8);
    }
    lineG.strokePath();
    this.diveLine = lineG;

    // After 2 s, execute dive
    this.time.delayedCall(2000, () => {
      // remove guide
      this.diveLine.destroy();

      // Boss dive: very fast vertical drop
      // Position boss at diveX, starting from hover height
      const startY = this.boss.y;
      this.boss.setScrollFactor(1);
      this.boss.x = diveX;
      // send straight down at 1200 px/s
      this.physics.world.enable(this.boss);
      this.boss.body.setVelocity(0, 1200);
      this.boss.body.setAllowGravity(false);

      // Stop dive upon contacting a platform
      this.physics.add.collider(this.boss, this.platforms, () => {
        // freeze dive
        this.boss.body.setVelocity(0);
        this.boss.body.destroy();

        // fix boss to screen position
        this.bossScreenX = this.boss.x - cam.scrollX;

        // schedule next dive
        this.scheduleBossDive();
      }, null, this);
    });
  }
}
