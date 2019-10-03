import Constants from './constants.js';
import Sounds from './sounds.js';

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

export default class MainMenu extends Phaser.Scene
{
    constructor ()
    {
        super('Options');
    }

    preload() 
    {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/plugins/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
    }

    create ()
    {
		this.add.image(Constants.Game.WIDTH / 2, Constants.Game.HEIGHT / 2, 'background')
            .setScrollFactor(0, 0)
            .setDepth(Constants.Depths.BACKGROUND);
				
        this.titleText = this.add.text(Constants.Game.WIDTH / 2, 100, Constants.Game.TITLE, 
            { fontFamily: 'Arial', fontSize: 48, color: '#e3f2ed' });
        this.titleText.setOrigin(0.5);
        this.titleText.setStroke('#203c5b', 6);
        this.titleText.setShadow(2, 2, '#2d2d2d', 4, true, false);

        this.backText = this.add.text(Constants.Game.WIDTH / 2, Constants.Game.HEIGHT - 148, 
			'Back', { fontFamily: 'Arial', fontSize: 74, color: '#e3f2ed' }).setInteractive();
        this.backText.setOrigin(0.5);
        this.backText.setStroke('#203c5b', 6);
        this.backText.setShadow(2, 2, '#2d2d2d', 4, true, false);

        this.bindEventHandlers();

        this.setupOptions();
    }

    bindEventHandlers()
    {
        this.backText.once('pointerdown', this.handleBackTextClick, this);
    }

    unbindEventHandlers()
    {   
        this.backText.off('pointerdown', this.handleBackTextClick, this);
    }

    handleBackTextClick (pointer, localX, localY, event) 
    {
        this.goBack();
    }

    setupOptions()
    {
        this.musicText = this.add.text(Constants.Game.WIDTH / 2 - 40, Constants.Game.HEIGHT / 2 - 78, 
            'Music Volume', { fontFamily: 'Arial', fontSize: 36, color: '#e3f2ed' }).setInteractive();
        this.musicText.setOrigin(0.5);
        this.musicText.setStroke('#203c5b', 6);
        this.musicText.setShadow(2, 2, '#2d2d2d', 4, true, false);
        var musicVolumeValue = this.add.text(Constants.Game.WIDTH / 2 - 150, Constants.Game.HEIGHT / 2 - 50, '')
                                .setDepth(Constants.Depths.UX);
        this.rexUI.add.slider({
                x: Constants.Game.WIDTH / 2,
                y: Constants.Game.HEIGHT / 2 - 40,
                width: 300,
                height: 20,
                orientation: 'y',
                value: Sounds.getMusicVolume(),

                track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_DARK),
                indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_PRIMARY),
                thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_PRIMARY),

                input: 'click', // 'drag'|'click'
                valuechangeCallback: function (value) {
                    musicVolumeValue.text = Math.floor(value * 100).toString();
                    Sounds.updateMusicVolume(value);
                },
            })
            .setDepth(Constants.Depths.UX - 1)
            .layout();

        this.soundText = this.add.text(Constants.Game.WIDTH / 2 - 40, Constants.Game.HEIGHT / 2 + 4, 
            'Sound Volume', { fontFamily: 'Arial', fontSize: 36, color: '#e3f2ed' }).setInteractive();
        this.soundText.setOrigin(0.5);
        this.soundText.setStroke('#203c5b', 6);
        this.soundText.setShadow(2, 2, '#2d2d2d', 4, true, false);
        var soundVolumeValue = this.add.text(Constants.Game.WIDTH / 2 - 150, Constants.Game.HEIGHT / 2 + 30, '')
                                .setDepth(Constants.Depths.UX);
        this.rexUI.add.slider({
                x: Constants.Game.WIDTH / 2,
                y: Constants.Game.HEIGHT / 2 + 40,
                width: 300,
                height: 20,
                orientation: 'y',
                value: Sounds.getSoundVolume(),

                track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_DARK),
                indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_PRIMARY),
                thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_PRIMARY),

                input: 'click', // 'drag'|'click'
                valuechangeCallback: function (value) {
                    soundVolumeValue.text = Math.floor(value * 100).toString();
                    Sounds.updateSoundVolume(value);
                },
            })
            .setDepth(Constants.Depths.UX - 1)
            .layout();

    }

    goBack() 
    {
        this.unbindEventHandlers();
        this.scene.stop();
        this.scene.resume('MainMenu');
    }
}