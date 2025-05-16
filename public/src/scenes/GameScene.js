import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class GameScene extends Phaser.Scene {
  init(data) {
    this.seed = data.seed;
    this.mode = data.mode || 'infinite';
    Phaser.Math.RND.sow([this.seed]);
    this.hearts = 3;
    this.bossDived = false;
  }

  constructor() {
    super('Game');
    this.lastX = 0; this.lastY = 550;
    this.chaser = null;
    this.boss = null;
    this.spears = null;
    this.bossDiveTimer = null;
  }

  create() {
    // UI
    this.add.text(780,10,`Seed: ${this.seed}`,{
      font:'20px Arial', fill:'#fff',
      stroke:'#000', strokeThickness:3
    }).setScrollFactor(0).setOrigin(1,0);
    this.heartsText = this.add.text(20,10,'❤️❤️❤️',{font:'20px Arial'}).setScrollFactor(0);

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

    // Chase
    if (this.mode==='chase') {
      this.time.delayedCall(5000, ()=>{
        this.chaser = this.physics.add.sprite(100,500,'chaser').setBounce(0.1);
        this.physics.add.collider(this.chaser,this.platforms);
        this.physics.add.overlap(this.chaser,this.player,()=>this.scene.start('Title'));
      });
    }

    // Boss & Hard Boss
    if (this.mode==='boss' || this.mode==='hardboss') {
      // Cloud
      this.boss = this.add.image(0,0,'boss').setScale(1.5).setScrollFactor(1);

      // Spears (both modes) but speed differs
      this.spears = this.physics.add.group({ allowGravity:false });
      this.physics.add.overlap(this.player,this.spears,(p,s)=>{
        s.destroy();
        this.hearts--;
        this.heartsText.text = '❤️'.repeat(this.hearts);
        if (this.hearts<=0) this.scene.start('Title');
      });

      const delay = 1500;
      const speed = this.mode==='boss' ? 300 : 150;  // half speed in hardboss

      this.time.addEvent({
        delay, loop: true, callback: ()=>{
          const cam = this.cameras.main;
          const bx = this.player.x;
          const by = cam.scrollY + 80;
          this.boss.setPosition(bx, by);

          const spear = this.spears.create(bx, by, 'spear');
          const angle = Phaser.Math.Angle.Between(bx, by, this.player.x, this.player.y);
          spear.setRotation(angle);
          this.physics.velocityFromRotation(angle, speed, spear.body.velocity);
        }
      });

      // Boss dives only in normal boss mode
      if (this.mode==='boss') this.scheduleBossDive();
    }
  }

  update() {
    const SPEED=200, JUMP_Y=-450;

    // Player movement & jump
    if (this.cursors.left.isDown||this.aKey.isDown) this.player.setVelocityX(-SPEED);
    else if (this.cursors.right.isDown||this.dKey.isDown) this.player.setVelocityX(SPEED);
    else this.player.setVelocityX(0);
    if (this.cursors.space.isDown && this.player.body.touching.down)
      this.player.setVelocityY(JUMP_Y);

    // Chase AI
    if (this.chaser) {
      const dir = this.player.x > this.chaser.x ? 1 : -1;
      this.chaser.setVelocityX(dir * SPEED * 0.8);
      if (this.chaser.body.touching.down) this.chaser.setVelocityY(JUMP_Y);
    }

    // Boss hover until after dive (bossDived=false), then fixed
    if (this.boss) {
      const cam = this.cameras.main;
      if (this.mode==='hardboss' || !this.bossDived) {
        this.boss.x = this.player.x;
        this.boss.y = cam.scrollY + 80;
      }
      // else remains at fixed scrollFactor=0 X
    }

    // Spears: despawn off-screen & gentle homing
    if (this.spears) {
      const cam = this.cameras.main;
      this.spears.getChildren().forEach(sp => {
        if (sp.y > cam.scrollY + cam.height + 50 ||
            sp.x < cam.scrollX - 50 ||
            sp.x > cam.scrollX + cam.width + 50) {
          sp.destroy();
        } else {
          const toP = new Phaser.Math.Vector2(
            this.player.x - sp.x,
            this.player.y - sp.y
          ).normalize().scale(20);
          sp.body.velocity.add(toP);
        }
      });
    }

    // Spawn platforms
    const camR = this.cameras.main.scrollX + 800;
    if (this.lastX < camR) {
      const newY = Phaser.Math.Clamp(
        this.lastY + Phaser.Math.Between(-100,100),
        300,550
      );
      this.spawnPlatform(this.lastX + Phaser.Math.Between(100,220), newY);
    }

    // Fall teleport
    const voidY = this.cameras.main.scrollY + 700;
    if (this.player.y > voidY) this.teleportAboveNearest(this.player, 30);
    if (this.chaser && this.chaser.y > voidY) this.teleportAboveNearest(this.chaser, 0);
  }

  scheduleBossDive() {
    const delay = Phaser.Math.Between(10000,15000);
    this.bossDiveTimer = this.time.delayedCall(delay, ()=> this.startBossDive());
  }

  startBossDive() {
    this.bossDived = true;
    // enable physics on boss
    this.physics.world.enable(this.boss);
    this.boss.body.setVelocity(0,1200);
    this.boss.body.setAllowGravity(false);
    this.physics.add.collider(this.boss,this.platforms, ()=>{
      this.boss.body.setVelocity(0);
      this.boss.body.destroy();
      this.boss.setScrollFactor(0);
      this.bossDiveTimer = null;
      this.scheduleBossDive();
    }, null, this);
  }

  spawnPlatform(x,y) {
    const p = this.platforms.create(x,y,'platform').setOrigin(0);
    p.refreshBody();
    this.lastX = x; this.lastY = y;
  }

  teleportAboveNearest(sprite, offsetY=0) {
    let best=null,md=Infinity;
    this.platforms.getChildren().forEach(p=>{
      const cx=p.x + p.displayWidth/2, d=Math.abs(sprite.x-cx);
      if(d<md){md=d;best=p;}
    });
    if(best){
      sprite.setPosition(
        best.x + best.displayWidth/2,
        best.y - sprite.displayHeight/2 - offsetY
      );
      if(sprite.body) sprite.setVelocity(0);
    }
  }
}
