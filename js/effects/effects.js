import Constants from '../constants.js';
import Utils from '../utils.js';
import Sounds from '../sounds.js';
import ItemData from '../itemdata.js';

export default class Effects 
{
    CONFIGS = {
        BASIC_ATTACK_NORMAL_DAMAGE_TEXT: {
            xamp: 0,
            yamp: -100,
            scale: 1.0,
            color: 0xffff00,
            offsetX: 0,
            offsetY: -20,
            duration: 500,
            reverseMove: false
        },
        REST_HEALING_TEXT: {
            xamp: 0,
            yamp: 80,
            scale: 1.0,
            color: 0x00ff00,
            offsetX: 0,
            offsetY: -80,
            duration: 400,
            reverseMove: true
        }
    };

    constructor(scene) {
        this.scene = scene;
    }

    create() {
        this.scene.anims.create({key: 'bash', frames: this.scene.anims.generateFrameNames('bash', {start: 0, end: 2, suffix: '.png'}), 
            frameRate: 12, repeat: 0});
        this.slashEffect = this.scene.add.sprite(this, 0, 0, 'bash', '0.png');
        this.slashEffect.setOrigin(0.5, 0.5);
        this.slashEffect.setScrollFactor(0, 0);
        this.slashEffect.setDepth(Constants.Depths.EFFECTS);
        this.slashEffect.setVisible(false);

        this.damageText = this.scene.add.text(0, 0, '0', 
                    { fontFamily: "Arial", fontSize: 32, color: "#ffffff" });
        this.damageText.setStroke('#444444', 2);
        this.damageText.setShadow(2, 2, "#333333", 2, true, true);
        this.damageText.setScrollFactor(0, 0).setDepth(Constants.Depths.EFFECTS).setOrigin(0.5, 0.5);
        this.damageText.setVisible(false);

        this.defendIcon = this.scene.add.image(0, 0, 'items', ItemData.wood_shield.id + '.png')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.EFFECTS).setOrigin(0.5, 0.5);
        this.defendIcon.setVisible(false);

        this.restIcon = this.scene.add.image(0, 0, 'items', ItemData.coffee.id + '.png')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.EFFECTS).setOrigin(0.5, 0.5);
        this.restIcon.setVisible(false);
    }

    flicker(startTint, endTint, entity, duration) {
        var scene = this.scene;
        scene.tweenStep = 0;
        scene.tweens.add({
            targets: scene,
            tweenStep: 100,
            onUpdate: function () {
                var col = Phaser.Display.Color.Interpolate.ColorWithColor(startTint, endTint, 100, scene.tweenStep);
                var updateColor = Phaser.Display.Color.GetColor(col.r, col.g, col.b);
                entity.setTint(updateColor);
            },
            duration: duration,
            yoyo: true
        });
    }

    playDamageNumberEffect(entity, value, config, oncomplete) {
        this.damageText.setVisible(true);
        this.damageText.setText(value.toString());
        this.damageText.setScale(config.scale, config.scale);
        var screenCoords = Utils.getScreenCoordinates(entity, this.scene.cameras.main, Constants.Game.WIDTH, Constants.Game.HEIGHT);
        this.damageText.x = screenCoords.x + config.offsetX;
        this.damageText.y = screenCoords.y + config.offsetY;
        this.damageText.setTint(config.color);

        var from = {x: (config.reverseMove ? this.damageText.x + config.xamp : this.damageText.x), 
                    y: (config.reverseMove ? this.damageText.y + config.yamp : this.damageText.y)};
        var to = {x: (config.reverseMove ? this.damageText.x : this.damageText.x + config.xamp), 
                  y: (config.reverseMove ? this.damageText.y : this.damageText.y + config.yamp)};

        var effectView = this.damageText;
        this.scene.tweens.add({
            targets: this.damageText,
            x: {from: from.x, to: to.x},
            y: {from: from.y, to: to.y},
            alpha: {from: 1.0, to: 0.0},
            repeat: 0,
            duration: config.duration,
            onComplete: function () {
                oncomplete();
                effectView.setVisible(false);
            }
        });
    }

    playRestEffect(entity, offsetX, offsetY, onComplete) {
        this.flicker(Phaser.Display.Color.HexStringToColor('#ffffff'), 
                     Phaser.Display.Color.HexStringToColor('#00ff00'), entity, 400);

        var screenCoords = Utils.getScreenCoordinates(entity, this.scene.cameras.main, Constants.Game.WIDTH, Constants.Game.HEIGHT);
        this.restIcon.x = screenCoords.x + offsetX;
        this.restIcon.y = screenCoords.y + offsetY;
        this.restIcon.setVisible(true);
        
        // TODO - maybe needs to be taken out?
        Sounds.playSound('heal');

        this.scene.tweens.add({
            targets: this.restIcon,
            y: {from: this.restIcon.y, to: this.restIcon.y - 100},
            alpha: {from: 1.0, to: 0.0},
            duration: 400,
            onComplete: onComplete
        });
    }

    playDefendEffect(entity, offsetX, offsetY, onComplete) {
        this.flicker(Phaser.Display.Color.HexStringToColor('#ffffff'), 
                     Phaser.Display.Color.HexStringToColor('#ffff00'), entity, 400);

        var screenCoords = Utils.getScreenCoordinates(entity, this.scene.cameras.main, Constants.Game.WIDTH, Constants.Game.HEIGHT);
        this.defendIcon.x = screenCoords.x + offsetX;
        this.defendIcon.y = screenCoords.y + offsetY;
        this.defendIcon.setVisible(true);
        
        // TODO
        Sounds.playSound('clink');

        var effectView = this.defendIcon;
        this.scene.tweens.add({
            targets: this.defendIcon,
            y: {from: this.defendIcon.y, to: this.defendIcon.y - 100},
            alpha: {from: 1.0, to: 0.0},
            duration: 400,
            onComplete: function () {
                onComplete();
                effectView.setVisible(false);
            }
        });
    }

    playBasicAttack(entity, offsetX, offsetY, onComplete) {
        this.flicker(Phaser.Display.Color.HexStringToColor('#ffffff'), 
                     Phaser.Display.Color.HexStringToColor('#ff0000'), entity, 250);

        var screenCoords = Utils.getScreenCoordinates(entity, this.scene.cameras.main, Constants.Game.WIDTH, Constants.Game.HEIGHT);
        this.slashEffect.x = screenCoords.x + offsetX;
        this.slashEffect.y = screenCoords.y + offsetY;

        this.slashEffect.setVisible(true);
        this.slashEffect.play('bash');

        // TODO 
        Sounds.playSound('bash');

        var effectView = this.slashEffect;
        this.slashEffect.on('animationcomplete', function() {
            onComplete();
            effectView.setVisible(false);
        }, this);
    }
}