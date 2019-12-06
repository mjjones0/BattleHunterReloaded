import Constants from './constants.js';

export default class Preloader extends Phaser.Scene
{
    constructor ()
    {
        super('Preloader');
        this.loadText;
    }

    preload ()
    {
        this.loadText = this.add.text(Constants.Game.WIDTH / 2, Constants.Game.HEIGHT / 2 - 48, 
																			'Loading ...', { fontFamily: 'Arial', fontSize: 48, color: '#e3f2ed' });
        this.loadText.setOrigin(0.5);
        this.loadText.setStroke('#203c5b', 6);
        this.loadText.setShadow(2, 2, '#2d2d2d', 4, true, false);

				// load generic assets
        this.load.setPath('assets/');
        this.load.image('background', [ 'background.png' ]);
        this.load.image('gamebg', [ 'gamebackground.png' ]);
        this.load.image('tile', [ 'tile.png']);
        this.load.image('particle', ['blue.png']);
        this.load.image('block', ['gray_block.png']);
        this.load.image('cube', ['cube.png']);
        this.load.image('obsidian', ['obsidian.png']);
        this.load.image('chocolate', ['chocolate.png']);
        this.load.image('clay', ['clay.png']);
        this.load.image('deepstone', ['deepstone.png']);
        this.load.image('watermelon', ['watermelon.png']);
        this.load.image('yellow', ['yellow.png']);
        this.load.image('yellowgrass', ['yellowgrass.png']);
        this.load.image('turquoise', ['turquoise.png']);
        this.load.image('ice', ['ice.png']);
        this.load.image('grass', ['grass.png']);
        this.load.image('lapizlazuli', ['lapizlazuli.png']);
        this.load.image('forest', ['forest.png']);
        this.load.image('greybrick', ['greybrick.png']);
        this.load.image('autumn', ['autumn.png']);
        this.load.image('icon_attack', ['icon_attack.png']);
        this.load.image('icon_move', ['icon_move.png']);
        this.load.image('icon_defend', ['icon_defend.png']);
        this.load.image('icon_rest', ['icon_rest.png']);
        this.load.image('timer_border', ['timer_border.png']);
        this.load.image('deck', ['deck.png']);

        // load sprites
        this.load.setPath('assets/sprites/');
        this.load.atlas('hero', 'hero_tutorial.png', 'hero_tutorial.json');
        this.load.atlas('slime', 'slime_move.png', 'slime_move.json');
        this.load.atlas('dice', 'dice.png', 'dice.json');
        this.load.atlas('slash', 'basic_slash.png', 'basic_slash.json');
        this.load.atlas('bash', 'bash.png', 'bash.json');
        this.load.atlas('items', 'items.png', 'items.json');
        this.load.spritesheet('chest', 'modernchest-spritesheet.png', { frameWidth: 500, frameHeight: 500, endFrame: 35 });

        //  load audio
        this.load.setPath('assets/audio/');
        this.load.audio('menu', [ '01 Network.mp3' ]);
        this.load.audio('theme_0', [ '04 \'80s Memory.mp3' ]);
				this.load.audio('theme_1', [ '05 Eyes in Mind.mp3' ]);
				this.load.audio('theme_2', [ '06 Saboten.mp3' ]);
				this.load.audio('theme_gon', [ '09 GON\'s Theme.mp3' ]);
        this.load.audio('theme_results', [ '10 Results.mp3' ]);
        this.load.audio('ding', ['ding.wav']);
        this.load.audio('menu_cancel', ['menu_cancel.wav']);
        this.load.audio('menu_confirm', ['menu_confirm.wav']);
        this.load.audio('menu_move', ['menu_move.wav']);
        this.load.audio('tic_toc_click', ['tic_toc_click.wav']);
        this.load.audio('quick_notice', ['quick_notice.wav']);
        this.load.audio('med_notice', ['med_notice.wav']);
        this.load.audio('open_sound', ['opensound.wav']);
        this.load.audio('dice_roll', ['dice_roll.wav']);
        this.load.audio('dice_stop', ['dice_stop.wav']);
        this.load.audio('basic_slash', ['basic_slash.wav']);
        this.load.audio('swing', ['swing.wav']);
        this.load.audio('bash', ['bash.wav']);
        this.load.audio('clink', ['clink.wav']);
        this.load.audio('heal', ['heal.wav']);

        this.createAnimations();
        
        var rect = new Phaser.Geom.Rectangle(Constants.Game.WIDTH / 4, Constants.Game.HEIGHT * 0.55, Constants.Game.WIDTH / 2, 30);
        var gfx = this.add.graphics();
        this.load.on('progress', function (progress) {
          gfx
            .clear()
            .fillStyle(0x666666)
            .fillRectShape(rect)
            .fillStyle(0xffffff)
            .fillRect(rect.x, rect.y, progress * rect.width, rect.height);
        });
        this.load.on('complete', function () {
          gfx.destroy();
          this.loadText.setText("Click to Start").setInteractive().once('pointerdown', (pointer, localX, localY, event) => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.on('camerafadeoutcomplete', function() {
              this.scene.start('MainMenu');
            }, this);
          }, this);
        }, this);
    }

    createAnimations()
    {
    }
}
