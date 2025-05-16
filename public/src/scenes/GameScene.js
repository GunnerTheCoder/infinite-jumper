import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

const MAX_GAP = 250;
const MAX_DY  = 120;

export default class GameScene extends Phaser.Scene {
  init(data) {
    this.seed = data.seed;
    Phaser.Math.RND.sow([this.seed]);
    this.score = 0;
    this.level = 1;
  }

  constructor() {
    super('Game');
    this.lastX = 0;
  }

  create() {
    // Seed display
    this.add.text(780, 10, `Seed: ${this.seed}`, {
      font: '20px Arial', fill: '#fff', stroke:'#000', strokeThickness:3
    }).setScrollFactor(0).setOrigin(1,0);

    // Score & level
    this.scoreText = this.add.text(20,20, `⭐0  Lv1`, {
      font:'20px Arial', fill:'#fff', stroke:'#000', strokeThickness:3
    }).setScrollFactor(0);

    // World
    this.physics.world.setBounds(0,0,Number.MAX_SAFE_INTEGER,1000);
    this.cameras.main.setBounds(0,0,Number.MAX_SAFE_INTEGER,600);

    // Groups
    this.platforms = this.physics.add.staticGroup();
    this.stars     = this.physics.add.group({ allowGravity:false });

    // Initial platform
    this.spawnPlatform(0,550);

    // Player
    this.player = this.physics.add.sprite(100,500,'player').setBounce(0.1);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player,this.stars,(p,s)=>{
      s.destroy();
      this.score++;
      if(this.score % 10 === 0) this.level++;
      this.scoreText.setText(`⭐${this.score}  Lv${this.level}`);
    });

    // Camera & input
    this.cameras.main.startFollow(this.player,true,0.1,0.1);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.aKey = this.input.keyboard.addKey('A');
    this.dKey = this.input.keyboard.addKey('D');
  }

  update() {
    // Movement & jump
    const S=200;
    if(this.cursors.left.isDown||this.aKey.isDown) this.player.setVelocityX(-S);
    else if(this.cursors.right.isDown||this.dKey.isDown) this.player.setVelocityX(S);
    else this.player.setVelocityX(0);

    if(Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.body.touching.down){
      this.player.setVelocityY(-400);
    }

    // Spawn ahead
    const camRight = this.cameras.main.scrollX + 800;
    if(this.lastX < camRight) {
      const gap = Phaser.Math.Between(100, MAX_GAP);
      const newX = this.lastX + gap;
      let newY = this.lastY + Phaser.Math.Between(-MAX_DY, MAX_DY);
      newY = Phaser.Math.Clamp(newY, 300, 550);
      this.spawnPlatform(newX, newY);
      this.lastX = newX;
      this.lastY = newY;
    }

    // Void check → center of nearest platform
    const voidY = this.cameras.main.scrollY + 700;
    if(this.player.y > voidY) {
      let best=null, md=Infinity;
      this.platforms.getChildren().forEach(p=>{
        const cx = p.x + p.displayWidth/2;
        const d = Math.abs(this.player.x - cx);
        if(d < md){ md=d; best=p; }
      });
      if(best){
        const cx = best.x + best.displayWidth/2;
        const cy = best.y - this.player.displayHeight/2;
        this.player.setPosition(cx, cy);
        this.player.setVelocity(0,0);
      }
    }
  }

  spawnPlatform(x,y){
    // choose flat or slope
    const key = Phaser.Math.Between(0,1) === 0 ? 'platform-flat' : 'platform-slope';
    const plat = this.platforms.create(x, y, key).setOrigin(0);
    plat.refreshBody();

    // 30% chance for a star
    if(Phaser.Math.FloatBetween(0,1) < 0.3){
      const star = this.stars.create(x + 64, y - 40, 'star').setOrigin(0.5);
    }

    // record for next spawn
    this.lastX = x;
    this.lastY = y;
  }
}
