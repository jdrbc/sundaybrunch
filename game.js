class GameOver extends Phaser.Scene {

    constructor() {
        super({key: 'game_over'});
    }

    preload ()
    {
        this.load.image('end', 'assets/end.png');
        this.load.spritesheet('full_snowman', 'assets/full_snowman.png', { frameWidth: 32, frameHeight: 32 });
    }

    create ()
    {    
        this.sound.add('sad', { loop: true }).play();

        // load map
        this.add.image(0, 0, 'end').setOrigin(0);
        this.cameras.main.setBackgroundColor('#000000')

        this.full_snowman = this.physics.add.sprite(85, 85, 'full_snowman');
        this.anims.create({
            key: 'full_move',
            frames: this.anims.generateFrameNumbers('full_snowman', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.full_snowman.anims.play('full_move', true);

        console.log('reload');
        this.input.on('pointerdown', () => {
            console.log('reload');
            location.reload();
        });
    }
}

class Game extends Phaser.Scene {

    constructor() {
        super({key: 'game'})
    }

    preload()
    {
        this.load.image('map', './assets/map.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('snowman', 'assets/snowman.png', { frameWidth: 32, frameHeight: 32 });
    }

    create()
    {    
        this.sound.pauseOnBlur = false;

        // load music
        this.music = this.sound.add('music', { loop: true });
        this.music.play();

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
        this.cameras.main.centerOn(0, 0);
        this.cameras.main.setBackgroundColor('#ffffff')
        this.cameras.main.startFollow(this.player, true);
    }

    speedUpSnowman() {
        console.log('speed up'); 
        this.snowman.speed += 2.5; 
        this.time.delayedCall(1000, () => { this.speedUpSnowman(); });
    }

    youlose() {
        console.log('lose');
        this.scene.pause();
        this.music.stop();
        this.scene.start('game_over');
    }

    update() {
        // if snowman is > 200px away normal music speed,
        // otherwise increase pitch linearly up to 50px distance
        const dist = Phaser.Math.Distance.Between(this.snowman.x, this.snowman.y, this.player.x, this.player.y);
        if (dist) {
            this.music.rate = Math.min(2, Math.max(1, -.0066 * dist + 2.333));
        }

        // snowman follow player
        this.physics.moveToObject(this.snowman, this.player, this.snowman.speed);

        this.player.setVelocity(0);

        // keyboard
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-100);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(100);
        }

        if (this.cursors.up.isDown)
        {
            this.player.setVelocityY(-100);
        }
        else if (this.cursors.down.isDown)
        {
            this.player.setVelocityY(100);
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

class Intro extends Phaser.Scene {
    constructor() {
        super({
            key: 'intro'
        });
    }

    preload() {
        this.load.audio('music', 'assets/simple_loop.ogg');
        this.load.audio('sad', 'assets/sad.ogg');
        this.load.image('intro', 'assets/intro.png');
    }

    create() {
        // load map
        this.add.image(0, 0, 'intro').setOrigin(0);
        this.input.on('pointerdown', () => {
            console.log('pointerdown');
            this.scene.start('game');
         }, this);
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
    scene: [Intro, Game, GameOver],
    audio: {
        disableWebAudio: true
    },
    callbacks: {
    postBoot: function (game) {
      // In v3.15, you have to override Phaser's default styles
      game.canvas.style.width = '100%';
      game.canvas.style.height = '100%';
    }
  }
};

var game = new Phaser.Game(config);

