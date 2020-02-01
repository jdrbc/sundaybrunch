class GameOver extends Phaser.Scene {

    constructor() {
        super({key: 'game_over'});
    }

    preload ()
    {
        this.load.image('end', './assets/end.png');
        this.load.spritesheet('full_snowman', 'assets/full_snowman.png', { frameWidth: 32, frameHeight: 32 });
    }

    create ()
    {    
        // load map
        this.add.image(0, 0, 'end').setOrigin(0);

        this.full_snowman = this.physics.add.sprite(85, 85, 'full_snowman');
        this.anims.create({
            key: 'full_move',
            frames: this.anims.generateFrameNumbers('full_snowman', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.full_snowman.anims.play('full_move', true);
    }
}

class Game extends Phaser.Scene {

    constructor() {
        super({key: 'game'})
    }

    preload ()
    {
        this.load.image('map', './assets/map.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('snowman', 'assets/snowman.png', { frameWidth: 32, frameHeight: 32 });
    }

    create ()
    {    
        // load map
        this.add.image(0, 0, 'map').setOrigin(0);

        this.snowman = this.physics.add.sprite(256, 64, 'snowman');
        this.anims.create({
            key: 'move',
            frames: this.anims.generateFrameNumbers('snowman', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.snowman.anims.play('move', true);
        this.snowman.speed = 50;
        this.speedUpSnowman();

        // load player & set bounds
        this.player = this.physics.add.sprite(32, 32, 'dude');
        this.physics.world.setBounds(0, 0, 512, 475);
        this.player.setCollideWorldBounds(true);

        // so that move to pointer moves to center of sprite
        this.player.setOrigin(0.5, 0.5);

        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 2, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 6 }),
            frameRate: 10,
            repeat: -1
        });
        this.player.anims.play('down', true);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.overlap(this.player, this.snowman, () => { this.youlose(); }, null, this);

        // init camera
        // this.cameras.main.setZoom(4);
        this.cameras.main.centerOn(0, 0);
        this.cameras.main.setBounds(0, 0, 512, 475);
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setDeadzone(50, 50);
    }

    speedUpSnowman() {
        console.log('speed up'); 
        this.snowman.speed += 2.5; 
        this.time.delayedCall(1000, () => { this.speedUpSnowman(); });
    }

    youlose() {
        console.log('lose');
        this.scene.start('game_over');
    }

    update() {
        // snowman follow player
        this.physics.moveToObject(this.snowman, this.player, this.snowman.speed);

        this.player.setVelocity(0);

        // keyboard
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-100);
            this.player.flipX = true;   
            this.player.anims.play('right', true);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(100);
            this.player.flipX = false;
            this.player.anims.play('right', true);
        }

        if (this.cursors.up.isDown)
        {
            this.player.setVelocityY(-100);
            this.player.anims.play('down', true);   
        }
        else if (this. cursors.down.isDown)
        {
            this.player.setVelocityY(100);
            this.player.anims.play('up', true); 
        }

        var pointer = this.input.activePointer;
        if (pointer.isDown) {
            const worldpoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.physics.moveToObject(this.player, this.cameras.main.getWorldPoint(pointer.x, pointer.y), 100);
        }
        if (Math.abs(this.player.body.velocity.x) > Math.abs(this.player.body.velocity.y)) {
            if (this.player.body.velocity.x > 0) {
                this.player.flipX = false;
                this.player.anims.play('right', true);
            }
            if (this.player.body.velocity.x < 0) {
                this.player.flipX = true;
                this.player.anims.play('right', true);
            }
        } else {
            if (this.player.body.velocity.y > 0) {
                this.player.anims.play('down', true);
            }
            if (this.player.body.velocity.y < 0) {
                this.player.anims.play('up', true);
            }
        }
    }
}


var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 128,
    height: 256,
    pixelArt: true,
    physics: {
        default: 'arcade',
    },
    scene: [Game, GameOver],
    callbacks: {
    postBoot: function (game) {
      // In v3.15, you have to override Phaser's default styles
      game.canvas.style.width = '100%';
      game.canvas.style.height = '100%';
    }
  }
};

var game = new Phaser.Game(config);

