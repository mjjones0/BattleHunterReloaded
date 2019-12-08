import Constants from '../constants.js';

export default class Deck
{
    constructor(scene, initialSize) {
        this.scene = scene;
        this.initialSize = initialSize;
    }

    create() {
        this.deckIcon = this.scene.add.image(0, 6, 'deck')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0, 0);
    
        this.deckText = this.scene.add.text(50, 0, this.initialSize.toString(), 
                { fontFamily: "Arial", fontSize: 40, color: "#ffffff" });
        this.deckText.setStroke('#444444', 2);
        this.deckText.setShadow(2, 2, "#333333", 2, true, true);
        this.deckText.setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0.5, 0);

        this.view = this.scene.add.container(Constants.Game.WIDTH - 90, 4, [this.deckIcon, this.deckText]);
        this.view.setVisible(true);
        this.view.setScrollFactor(0, 0);
        this.view.setDepth(Constants.Depths.UX);
    }

    show() {
        this.view.setVisible(true);
    }

    hide() {
        this.view.setVisible(false);
    }

    visible() {
        return this.view.visible;
    }

    update(deck) {
        this.deckText.setText(deck.length);
    }
}