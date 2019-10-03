import Constants from './constants.js';
import Sounds from './sounds.js';

export default class MainMenu extends Phaser.Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    preload() 
    {
        Sounds.addMusic('menu', this.sound.add('menu'));
    }

    create ()
    {
        this.add.image(Constants.Game.WIDTH / 2, Constants.Game.HEIGHT / 2, 'background')
            .setScrollFactor(0, 0)
            .setDepth(Constants.Depths.BACKGROUND);
        
        Sounds.playMusic('menu', true);
				
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

        this.optionsText = this.add.text(Constants.Game.WIDTH / 2, Constants.Game.HEIGHT / 2 + 74 + 37, 
			'Options', { fontFamily: 'Arial', fontSize: 74, color: '#e3f2ed' }).setInteractive();
        this.optionsText.setOrigin(0.5);
        this.optionsText.setStroke('#203c5b', 6);
        this.optionsText.setShadow(2, 2, '#2d2d2d', 4, true, false);

        this.bindEventHandlers();
    }

    bindEventHandlers ()
    {
        this.playText.once('pointerdown', this.handlePlayTextClick, this);
        this.optionsText.on('pointerdown', this.handleOptionsTextClick, this);
    }

    unbindEventHandlers()
    {   
        this.playText.off('pointerdown', this.handlePlayTextClick, this);
        this.optionsText.off('pointerdown', this.handleOptionsTextClick, this);
    }

    handlePlayTextClick (pointer, localX, localY, event)
    {
        this.startGame();
    }

    handleOptionsTextClick (pointer, localX, localY, event)
    {
        this.startOptions();
    }

    startOptions()
    {
        this.scene.pause();
        this.scene.launch('Options');
    }

    startGame ()
    {
        this.tweens.add({
            targets: this.music, 
            volume: 0,
            duration: 1000,
            onComplete: function () {
                Sounds.stopMusic('menu');
            }
        });
        this.cameras.main.fadeOut(1000);
        this.cameras.main.on('camerafadeoutcomplete', function() {
            this.unbindEventHandlers();
            this.scene.start('MainGame');
		}, this);
    }
}