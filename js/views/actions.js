import Constants from '../constants.js';
import ItemData from '../itemdata.js';

export default class Actions
{
    constructor(scene) {
        this.scene = scene;
    }

    create() {
        var attackBorder = this.scene.add.rectangle(0, 0, 40, 40, 0x321541);
        attackBorder.setStrokeStyle(4, 0xffffff);
        attackBorder.setAlpha(0.75);
        attackBorder.setScrollFactor(0, 0);
        attackBorder.setDepth(Constants.Depths.UX);
        var defendBorder = this.scene.add.rectangle(0, 0, 40, 40, 0x321541);
        defendBorder.setStrokeStyle(4, 0xffffff);
        defendBorder.setAlpha(0.75);
        defendBorder.setScrollFactor(0, 0);
        defendBorder.setDepth(Constants.Depths.UX);
        var moveBorder = this.scene.add.rectangle(0, 0, 40, 40, 0x321541);
        moveBorder.setStrokeStyle(4, 0xffffff);
        moveBorder.setAlpha(0.75);
        moveBorder.setScrollFactor(0, 0);
        moveBorder.setDepth(Constants.Depths.UX);
        var restBorder = this.scene.add.rectangle(0, 0, 40, 40, 0x321541);
        restBorder.setStrokeStyle(4, 0xffffff);
        restBorder.setAlpha(0.75);
        restBorder.setScrollFactor(0, 0);
        restBorder.setDepth(Constants.Depths.UX);

        var attackIcon = this.scene.add.image(0, 0, 'items', ItemData.sword.id + '.png')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.UX);
        var defendIcon = this.scene.add.image(0, 0, 'items', ItemData.wood_shield.id + '.png')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.UX);
        var moveIcon = this.scene.add.image(0, 0, 'items', ItemData.boots.id + '.png')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.UX);
        var restIcon = this.scene.add.image(0, 0, 'items', ItemData.coffee.id + '.png')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.UX);

        this.attackContainer = this.scene.add.container(0, 0, [attackBorder, attackIcon]);
        this.defendContainer = this.scene.add.container(0, 0, [defendBorder, defendIcon]);
        this.moveContainer = this.scene.add.container(0, 0, [moveBorder, moveIcon]);
        this.restContainer = this.scene.add.container(0, 0, [restBorder, restIcon]);

        this.attackContainer.setScrollFactor(0, 0);
        this.defendContainer.setScrollFactor(0, 0);
        this.moveContainer.setScrollFactor(0, 0);
        this.restContainer.setScrollFactor(0, 0);

        this.attackContainer.setDepth(Constants.Depths.UX);
        this.defendContainer.setDepth(Constants.Depths.UX);
        this.moveContainer.setDepth(Constants.Depths.UX);
        this.restContainer.setDepth(Constants.Depths.UX);

        this.attackContainer.setVisible(false);
        this.defendContainer.setVisible(false);
        this.moveContainer.setVisible(false);
        this.restContainer.setVisible(false);
    }

    show() {
        this.attackContainer.setVisible(true);
        this.defendContainer.setVisible(true);
        this.moveContainer.setVisible(true);
        this.restContainer.setVisible(true);

        this.scene.tweens.add({
            targets: this.moveContainer,
            x: {from: Constants.Game.WIDTH / 2, to: Constants.Game.WIDTH / 2 - 50},
            y: {from: Constants.Game.HEIGHT / 2, to: Constants.Game.HEIGHT / 2 - 50},
            scaleX: {from: 0.0, to: 1.0},
            scaleY: {from: 0.0, to: 1.0},
            duration: 150
        });
        this.scene.tweens.add({
            targets: this.attackContainer,
            x: {from: Constants.Game.WIDTH / 2, to: Constants.Game.WIDTH / 2 - 50},
            y: {from: Constants.Game.HEIGHT / 2, to: Constants.Game.HEIGHT / 2},
            scaleX: {from: 0.0, to: 1.0},
            scaleY: {from: 0.0, to: 1.0},
            duration: 150,
            onComplete: function() {}
        });
        this.scene.tweens.add({
            targets: this.defendContainer,
            x: {from: Constants.Game.WIDTH / 2, to: Constants.Game.WIDTH / 2 + 50},
            y: {from: Constants.Game.HEIGHT / 2, to: Constants.Game.HEIGHT / 2 - 50},
            scaleX: {from: 0.0, to: 1.0},
            scaleY: {from: 0.0, to: 1.0},
            duration: 150,
            onComplete: function() {}
        });
        this.scene.tweens.add({
            targets: this.restContainer,
            x: {from: Constants.Game.WIDTH / 2, to: Constants.Game.WIDTH / 2 + 50},
            y: {from: Constants.Game.HEIGHT / 2, to: Constants.Game.HEIGHT / 2},
            scaleX: {from: 0.0, to: 1.0},
            scaleY: {from: 0.0, to: 1.0},
            duration: 150,
            onComplete: function() {}
        });
    }

    hide() {
        var attackContainer = this.attackContainer;
        var defendContainer = this.defendContainer;
        var moveContainer = this.moveContainer;
        var restContainer = this.restContainer;

        this.scene.tweens.add({
            targets: this.moveContainer,
            x: {from: Constants.Game.WIDTH / 2 - 50, to: Constants.Game.WIDTH / 2},
            y: {from: Constants.Game.HEIGHT / 2 - 50, to: Constants.Game.HEIGHT / 2},
            scaleX: {from: 1.0, to: 0.0},
            scaleY: {from: 1.0, to: 0.0},
            duration: 150,
            onComplete: function() {
                moveContainer.setVisible(false);
            }
        });
        this.scene.tweens.add({
            targets: this.attackContainer,
            x: {from: Constants.Game.WIDTH / 2 - 50, to: Constants.Game.WIDTH / 2},
            y: {from: Constants.Game.HEIGHT / 2, to: Constants.Game.HEIGHT / 2},
            scaleX: {from: 1.0, to: 0.0},
            scaleY: {from: 1.0, to: 0.0},
            duration: 150,
            onComplete: function() {
                attackContainer.setVisible(false);
            }
        });
        this.scene.tweens.add({
            targets: this.defendContainer,
            x: {from: Constants.Game.WIDTH / 2 + 50, to: Constants.Game.WIDTH / 2},
            y: {from: Constants.Game.HEIGHT / 2 - 50, to: Constants.Game.HEIGHT / 2},
            scaleX: {from: 1.0, to: 0.0},
            scaleY: {from: 1.0, to: 0.0},
            duration: 150,
            onComplete: function() {
                defendContainer.setVisible(false);
            }
        });
        this.scene.tweens.add({
            targets: this.restContainer,
            x: {from: Constants.Game.WIDTH / 2 + 50, to: Constants.Game.WIDTH / 2},
            y: {from: Constants.Game.HEIGHT / 2, to: Constants.Game.HEIGHT / 2},
            scaleX: {from: 1.0, to: 0.0},
            scaleY: {from: 1.0, to: 0.0},
            duration: 150,
            onComplete: function() {
                restContainer.setVisible(false);
            }
        });
    }

    visible() {
        return this.restContainer.visible;
    }
}