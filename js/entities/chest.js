import Constants from '../constants.js';
import Utils from '../utils.js';
import Sounds from '../sounds.js';
import ItemData from '../itemdata.js';

export default class Chest extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y, loot) {
        super(scene, x, y, 'chest');
				
        this.setOrigin(0.5, 0.75);
        this.setScale(80.0 / 500.0, 80.0 / 500.0);
        this.setDepth(Constants.Depths.ACTOR);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;

        this.createAnimations(scene);
        this.assignTile(x, y);
        this.loot = loot;
        this.alive = true;

        this.lootIcon = this.scene.add.image(0, 0, 'items', ItemData[loot].id + '.png')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.EFFECTS).setOrigin(0.5, 0.5);
        this.lootIcon.setVisible(false);
    }

    createAnimations(scene) {
        scene.anims.create({key: 'openSouthEast', frames: scene.anims.generateFrameNumbers('chest', { start: 0, end: 2, first: 0 }), 
            frameRate: 6, repeat: 0 });
        this.play('openSouthEast');
        this.anims.pause();
    }

    assignTile(x, y) {
        this.xTile = x;
        this.yTile = y;
        this.x = this.xTile * Constants.Game.TILE_SIZE;
        this.y = this.yTile * Constants.Game.TILE_SIZE;
    }

    spawn(x, y) {
        this.alive = true;
        this.assignTile(x, y);
    }

    open(player, onComplete) {
        if (!this.alive) {
            return;
        }
        this.alive = false;
        Sounds.playSound('open_sound');
        this.play('openSouthEast');
        this.getLoot(player);

        var chest = this;
        var scene = this.scene;
        scene.time.delayedCall(250, function() {
            Utils.fadeOutDestroy(scene, chest, 1000, function () {
                scene.renderer.removeEntity(chest);
            });
            onComplete();
        }, [], scene);
    }

    getLoot(player) {
        // play animation for the loot on the scene
        var screenCoords = this.scene.getScreenCoordinates(this);
        this.lootIcon.x = screenCoords.x;
        this.lootIcon.y = screenCoords.y;
        this.lootIcon.setVisible(true);

        var lootIcon = this.lootIcon;
        this.scene.tweens.add({
            targets: this.lootIcon,
            y: {from: this.lootIcon.y, to: this.lootIcon.y - 60},
            alpha: {from: 1.0, to: 0.25},
            duration: 1000,
            onComplete: function () {
                lootIcon.setVisible(false);
            }
        });

        // add loot to player's inventory?
        player.config.inv.push(this.loot);
    }
}