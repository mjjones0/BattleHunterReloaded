import Utils from '../utils.js';
import Sounds from '../sounds.js';
import Constants from '../constants.js';

export default class Die extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, scale)  {
        super(scene, x, y, 'dice', '0.png');

        this.setOrigin(0.5, 0.5);
        this.setScale(scale, scale);
        this.setDepth(Constants.Depths.UX);
        this.setScrollFactor(0, 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.isAlive = true;
        this.setVisible(false);

        this.rolling = false;

        Sounds.addSound('dice_roll',        scene.sound.add('dice_roll'));
        Sounds.addSound('dice_stop',        scene.sound.add('dice_stop'));

        this.sequence = [4,2,3,0,5,1,2,0,4,1,5,0,2,3,1,5,0,2,3,1,5,4,1,0,3,4,1,5,2,3,4,1,5];
    }

    roll(frameDuration, totalDuration, holdDuration, onRollComplete) {
        this.rolling = true;
        this.frameDuration = frameDuration;
        this.totalDuration = totalDuration;
        this.frameRollTime = 0;
        this.totalRollTime = 0;
        this.onRollComplete = onRollComplete;
        this.holdDuration = holdDuration;
        this.setVisible(true);
        Sounds.playSound('dice_roll');
        this.startIndex = Utils.getRandomInt(0, this.sequence.length - 1);
        this.currIndex = this.startIndex;
        this.setFrame(this.sequence[this.startIndex] + '.png');
    }

    update(delta) {
        if (this.rolling) {
            console.log(delta);
            this.totalRollTime += delta;
            this.frameRollTime += delta;

            if (this.totalRollTime >= this.totalDuration) {
                console.log('finished roll');
                Sounds.stopSound('dice_roll');
                Sounds.playSound('dice_stop');
                this.rolling = false;
                var callback = this.onRollComplete;
                var sprite = this;
                var resultFrame = Utils.getRandomInt(0, 5);
                var resultValue = resultFrame + 1;
                this.setFrame(resultFrame + '.png');
                this.scene.time.delayedCall(this.holdDuration, function() {
                    sprite.setVisible(false);
                    callback(resultValue);
                }, [], this.scene);
                return;
            }

            if (this.frameRollTime >= this.frameDuration) {
                console.log('setting new frame');
                this.frameRollTime = 0;
                this.currIndex += 1;
                this.currIndex = this.currIndex % this.sequence.length;
                this.setFrame(this.sequence[this.currIndex] + '.png');
            }
        }
    }
}