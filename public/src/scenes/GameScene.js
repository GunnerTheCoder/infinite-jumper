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
  }

  create() {
    // UI
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

    // Input & camera
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

    // Boss mode: hover + spears
    if (this.mode==='boss') {
      // create spear group & collision
      this.spears = this.physics.add.group({ allowGravity:false });
      this.physics.add.overlap(this.player,this.spears, (p,s) => {
        s.destroy();
        this.hearts--;
        this.heartsText.text = '❤️'.repeat(this.hearts);
        if (this.hearts <= 0) this.scene.start('Title');
      });

      // boss cloud, scaled up
      this.boss = this.add.image(0,0,'boss')
        .setScale(1.5)
        .setScrollFactor(1);

      // spear-throw timer
      this.time.addEvent({
        delay: 1500,
        loop: true,
        callback: () => {
          const cam = this.cameras.main;
          const bx = this.player.x;             // always centered on player X
          const by = cam.scrollY + 80;          // fixed hover Y
          this.boss.setPosition(bx, by);

          // spawn spear
          const spear = this.spears.create(bx, by, 'spear');
          const angle = Phaser.Math.Angle.Between(bx, by, this.player.x, this.player.y);
          spear.setRotation(angle);
          this.physics.velocityFromRotation(angle, 300, spear.body.velocity);
        }
      });
    }
  }

  update() {
    const SPEED = 200, JUMP_Y = -450;

    // Player move + hold-to-jump
    if (this.cursors.left.isDown || this.aKey.isDown) {
      this.player.setVelocityX(-SPEED);
    } else if (this.cursors.right.isDown || this.dKey.isDown) {
      this.player.setVelocityX(SPEED);
    } else {
      this.player.setVelocityX(0);
    }
    if (this.cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(JUMP_Y);
    }

    // Chaser AI
    if (this.chaser) {
      const dir = this.player.x > this.chaser.x ? 1 : -1;
      this.chaser.setVelocityX(dir * SPEED * 0.8);
      if (this.chaser.body.touching.down) {
        this.chaser.setVelocityY(JUMP_Y);
      }
    }

    // Boss hover (always above player)
    if (this.boss) {
      const cam = this.cameras.main;
      this.boss.x = this.player.x;
      this.boss.y = cam.scrollY + 80;
    }

    // gentle homing for spears
    if (this.spears) {
      this.spears.getChildren().forEach(spear => {
        const toPlayer = new Phaser.Math.Vector2(
          this.player.x - spear.x,
          this.player.y - spear.y
        ).normalize().scale(20);
        spear.body.velocity.add(toPlayer);
      });
    }

    // spawn platforms ahead
    const camR = this.cameras.main.scrollX + 800;
    if (this.lastX < camR) {
      const newY = Phaser.Math.Clamp(
        this.lastY + Phaser.Math.Between(-100,100),
        300, 550
      );
      this.spawnPlatform(this.lastX + Phaser.Math.Between(100,220), newY);
    }

    // void check + teleport 30px above center
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
      const d = Math.abs(sprite.x - cx);
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
}
