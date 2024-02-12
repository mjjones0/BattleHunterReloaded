import Constants from '../constants.js';

export default class BackDialog
{
    constructor(scene, x, y, cancelCallback, backCallback) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.cancelCallback = cancelCallback;
        this.backCallback = backCallback;
        this.create();
    }

    createButton(text, callback) {
        const button = this.scene.add.text(0, 0, text, {
            fontSize: '20px',
            backgroundColor: '#9b8738',
            padding: { x: 10, y: 5 },
            align: 'center'
        }).setInteractive();

        button.setScrollFactor(0, 0);
        button.setDepth(Constants.Game.BACK_DIALOG);

        button.on('pointerdown', () => {
            callback();
        });

        button.on('pointerover', () => {
            button.setStyle({ fill: '#ff0' });
        });

        button.on('pointerout', () => {
            button.setStyle({ fill: '#fff' });
        });

        return button;
    }

    create() {
        this.container = this.scene.add.container(this.x, this.y);

        const background = this.scene.add.rectangle(0, 0, 300, 200, 0x8a7627);
        this.container.add(background);

        const title = this.scene.add.text(0, -80, 'Escape Menu', {
            fontSize: '24px',
            color: '#fff'
        }).setOrigin(0.5, 0.5);
        this.container.add(title);

        const buttonCancel  = this.createButton('Cancel', this.cancelCallback);
        const buttonBack    = this.createButton('Back to Main Menu', this.backCallback);

        // Position buttons
        buttonCancel.setPosition(-50, -40);
        buttonBack.setPosition(-100, 40);

        this.container.add([buttonCancel, buttonBack]);

        // Initial visibility
        this.container.setVisible(false);

        // Set depth
        this.container.setScrollFactor(0, 0);
        this.container.setDepth(Constants.Depths.BACK_DIALOG);
    }

    resize(size) {
        if (size) {
            let heightRatio = size.height / Constants.Game.HEIGHT;
            let widthRatio = size.width / Constants.Game.WIDTH;
            let smallerRatio = Math.min(heightRatio, widthRatio);
            this.container.setScale(smallerRatio, smallerRatio);
            this.container.setPosition(size.width / 2, size.height / 2);
        }
    }

    setBackCallback(callback) {
        this.backCallback = callback;
    }

    setCancelCallback(callback) {
        this.cancelCallback = callback;
    }

    visible() {
        return this.container.visible;
    }

    show() {
        this.container.setVisible(true);
    }

    hide() {
        this.container.setVisible(false);
    }
}