import Constants from '../constants.js';
import Utils from '../utils.js';

export default class BackDialog
{
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.create();
    }

    create() {
        var dialog = this.scene.rexUI.add.dialog({
            x: this.x,
            y: this.y,

            background: this.scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

            content: this.scene.add.text(0, 0, 'Go back to the main menu?', {
                fontSize: '24px'
            }),

            actions: [
                Utils.createLabel(this.scene, 'Yes'),
                Utils.createLabel(this.scene, 'No')
            ],

            space: {
                title: 25,
                content: 25,
                action: 15,

                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
            },

            align: {
                actions: 'right', // 'center'|'left'|'right'
            },

            expand: {
                content: false, // Content is a pure text object
            }
        })
            .layout()
            .popUp(1000);

        this.print = this.scene.add.text(0, 0, '');
        dialog
            .on('button.click', function (button, groupName, index, pointer, event) {
                if (index == 0) {
                    this.confirmCallback();
                } else if (index == 1) {
                    this.denyCallback();
                }
                event.stopPropagation();
            }, this)
            .on('button.over', function (button, groupName, index, pointer, event) {
                button.getElement('background').setStrokeStyle(1, 0xffffff);
                event.stopPropagation();
            })
            .on('button.out', function (button, groupName, index, pointer, event) {
                button.getElement('background').setStrokeStyle();
                event.stopPropagation();
            });
        
        this.view = dialog;
        this.view.setVisible(false);
        this.view.setScrollFactor(0, 0);
        this.view.setDepth(Constants.Depths.UX);
    }

    setConfirmCallback(callback) {
        this.confirmCallback = callback;
    }

    setDenyCallback(callback) {
        this.denyCallback = callback;
    }

    visible() {
        return this.view.visible;
    }

    show() {
        this.view.setVisible(true);
    }

    hide() {
        this.view.setVisible(false);
    }
}