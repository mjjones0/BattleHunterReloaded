import Constants from './constants.js';

export default class MainMenu extends Phaser.Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    preload() 
    {
    }

    create ()
    {
		this.add.image(Constants.Game.WIDTH / 2, Constants.Game.HEIGHT / 2, 'background');
			
        this.music = this.sound.add('menu');
        this.music.loop = true;
        this.music.play();
				
        this.titleText = this.add.text(Constants.Game.WIDTH / 2, 100, Constants.Game.TITLE, 
            { fontFamily: 'Arial', fontSize: 48, color: '#e3f2ed' });
        this.titleText.setOrigin(0.5);
        this.titleText.setStroke('#203c5b', 6);
        this.titleText.setShadow(2, 2, '#2d2d2d', 4, true, false);
				
		this.playText = this.add.text(Constants.Game.WIDTH / 2, Constants.Game.HEIGHT / 2, 
			'Play', { fontFamily: 'Arial', fontSize: 74, color: '#e3f2ed' }).setInteractive();
        this.playText.setOrigin(0.5);
        this.playText.setStroke('#203c5b', 6);
        this.playText.setShadow(2, 2, '#2d2d2d', 4, true, false);

        this.playText.once('pointerdown', (pointer, localX, localY, event) => {
            this.startGame();
        }, this);
    }

    startGame ()
    {
        this.tweens.add({
            targets: this.music, 
            volume: 0,
            duration: 1000,
            onComplete: function () {
                this.music.stop();
            }
        });
        this.cameras.main.fadeOut(1000);
        this.cameras.main.on('camerafadeoutcomplete', function() {
            this.scene.start('MainGame');
		}, this);
    }
}