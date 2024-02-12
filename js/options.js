import Constants from './constants.js';
import Sounds from './sounds.js';
import Slider from './views/slider.js';

export default class Options extends Phaser.Scene
{
    constructor ()
    {
        super('Options');
    }

    preload() {}

    create()
    {
        let size = {'width': this.cameras.main.width, 'height': this.cameras.main.height};

		this.bg = this.add.image(size.width / 2, size.height / 2, 'background')
            .setScrollFactor(0, 0)
            .setScale(size.width / 1024, size.height / 1024)
            .setDepth(Constants.Depths.BACKGROUND);

        this.backText = this.add.text(size.width / 2, size.height * 0.8, 
			'Back', { fontFamily: 'Arial', fontSize: 48, color: '#e3f2ed' }).setInteractive();
        this.backText.setOrigin(0.5);
        this.backText.setStroke('#203c5b', 6);
        this.backText.setShadow(2, 2, '#2d2d2d', 4, true, false);

        var scene = this;
        this.backText.on('pointerover',function(pointer){
            scene.backText.setScale(1.2, 1.2);
        });
        this.backText.on('pointerout',function(pointer){
            scene.backText.setScale(1, 1);
        });

        this.bindEventHandlers();

        this.setupOptions();

        this.scale.on('resize', (resize) => {
            this.resizeAll(resize);
        });
        this.resizeAll(size);
    }

    resizeAll(size) {
        if (size && this.cameras && this.cameras.main) {
            this.bg.setPosition(size.width / 2, size.height / 2);
            this.bg.setScale(size.width / this.bg.texture.source[0].width, size.height / this.bg.texture.source[0].height);

            let fontScale = 48 * (size.height / Constants.Game.HEIGHT);

            this.backText.setPosition(size.width / 2, size.height * 0.8);
            this.backText.setFontSize(fontScale);

            this.musicText.setPosition(size.width / 2, size.height / 2 - fontScale * 2);
            this.musicText.setFontSize(fontScale);

            this.soundText.setPosition(size.width / 2, size.height / 2 + fontScale / 8);
            this.soundText.setFontSize(fontScale);

            let barWidth = this.musicSlider.width;
            let barTextHeight = this.musicVolumeValue.displayHeight;

            this.musicVolumeValue.setPosition(size.width / 2 - barWidth / 2, size.height / 2 - fontScale - barTextHeight / 2);
            this.soundVolumeValue.setPosition(size.width / 2 - barWidth / 2, size.height / 2 + fontScale - barTextHeight / 2);

            this.soundSlider.setPosition(size.width / 2, size.height / 2 + fontScale);
            this.musicSlider.setPosition(size.width / 2, size.height / 2 - fontScale);
        }
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
        let size = {'width': this.cameras.main.width, 'height': this.cameras.main.height};

        this.musicText = this.add.text(size.width / 2 - 40, size.height / 2 - 78, 
            'Music Volume', { fontFamily: 'Arial', fontSize: 36, color: '#e3f2ed' }).setInteractive();
        this.musicText.setOrigin(0.5);
        this.musicText.setStroke('#203c5b', 6);
        this.musicText.setShadow(2, 2, '#2d2d2d', 4, true, false);

        let musicVol = Sounds.getMusicVolume() * 100;
        let soundVol = Sounds.getSoundVolume() * 100;

        this.musicVolumeValue = this.add.text(size.width / 2 - 150, size.height / 2 - 50, musicVol, { fontFamily: 'Arial', fontSize: 16, color: '#e3f2ed' })
                                .setDepth(Constants.Depths.UX);

        var scene = this;
        this.musicSlider = new Slider(this, size.width / 2, size.height / 2 - 40, 300, 20, 0, 100);
        this.musicSlider.setValue(musicVol);
        let slider = this.musicSlider;
        this.musicSlider.notch.on('dragend', () => {
                scene.musicVolumeValue.text = Math.floor(slider.getValue()).toString();
                Sounds.updateMusicVolume(slider.getValue() / 100);
        });

        this.soundText = this.add.text(size.width / 2 - 40, size.height / 2 + 4, 
            'Sound Volume', { fontFamily: 'Arial', fontSize: 36, color: '#e3f2ed' }).setInteractive();
        this.soundText.setOrigin(0.5);
        this.soundText.setStroke('#203c5b', 6);
        this.soundText.setShadow(2, 2, '#2d2d2d', 4, true, false);
        this.soundVolumeValue = this.add.text(size.width / 2 - 150, size.height / 2 + 30, soundVol, { fontFamily: 'Arial', fontSize: 16, color: '#e3f2ed' })
                                .setDepth(Constants.Depths.UX);

        this.soundSlider = new Slider(this, size.width / 2, size.height / 2 + 40, 300, 20, 0, 100);
        this.soundSlider.setValue(soundVol);
        let sslider  = this.soundSlider;
        this.soundSlider.notch.on('dragend', () => {
                scene.soundVolumeValue.text = Math.floor(sslider.getValue()).toString();
                Sounds.updateSoundVolume(sslider.getValue() / 100);
        });
    }

    goBack() 
    {
        this.unbindEventHandlers();
        this.scene.resume('MainMenu');
        this.scene.stop();
    }
}