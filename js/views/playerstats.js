import Constants from '../constants.js';
import ItemData from '../itemdata.js';

export default class PlayerStats
{
    CARD_TYPES = {
        ATTACK: 'A',
        DEFENSE: 'D', 
        TRAP: 'T',
        MOVEMENT: 'M'
    }

    constructor(scene, x, y, player) {
        this.scene = scene;
        this.player = player;
        this.x = x;
        this.y = y;
        this.view = null;
        this.playerCardSprites = [];
        this.items = [];
        this.create();
    }

    create() {
        // 1 tab with stats
        this.statsBorder = this.scene.add.rectangle(0, 0, 210, 210, 0x321541);
        this.statsBorder.setStrokeStyle(4, 0xffffff);
        this.statsBorder.setAlpha(0.75);
        this.statsBorder.setOrigin(0, 0);
        this.statsBorder.setScrollFactor(0, 0);
        this.statsBorder.setDepth(Constants.Depths.UX);

        this.nameText = this.scene.add.text(105, 24, this.player.config.name, 
                                    { fontFamily: "Arial", fontSize: 40, color: "#ffffff" });
        this.nameText.setStroke('#444444', 2);
        this.nameText.setShadow(2, 2, "#333333", 2, true, true);
        this.nameText.setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0.5, 0.5);

        this.moveLabelText = this.scene.add.text(35, 4 + 40 + 12 + 4, 'Mv.', { fontFamily: "Arial", fontSize: 24, color: "#ffffff" });
        this.moveLabelText.setStroke('#444444', 2);
        this.moveLabelText.setShadow(2, 2, "#333333", 2, true, true);
        this.moveLabelText.setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0.5, 0.5);

        this.attackLabelText = this.scene.add.text(35 + 70, 4 + 40 + 12 + 4, 'At.', { fontFamily: "Arial", fontSize: 24, color: "#ffffff" });
        this.attackLabelText.setStroke('#444444', 2);
        this.attackLabelText.setShadow(2, 2, "#333333", 2, true, true);
        this.attackLabelText.setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0.5, 0.5);

        this.defenseLabelText = this.scene.add.text(35 + 140, 4 + 40 + 12 + 4, 'Df.', { fontFamily: "Arial", fontSize: 24, color: "#ffffff" });
        this.defenseLabelText.setStroke('#444444', 2);
        this.defenseLabelText.setShadow(2, 2, "#333333", 2, true, true);
        this.defenseLabelText.setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0.5, 0.5);

        this.moveValueText = this.scene.add.text(35, 4 + 40 + 12 + 4 + 24 + 4, this.player.config.mov, { fontFamily: "Arial", fontSize: 40, color: "#ffffff" });
        this.moveValueText.setStroke('#444444', 2);
        this.moveValueText.setShadow(2, 2, "#333333", 2, true, true);
        this.moveValueText.setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0.5, 0.5);

        this.attackValueText = this.scene.add.text(35 + 70, 4 + 40 + 12 + 4 + 24 + 4, this.player.config.atk, { fontFamily: "Arial", fontSize: 40, color: "#ffffff" });
        this.attackValueText.setStroke('#444444', 2);
        this.attackValueText.setShadow(2, 2, "#333333", 2, true, true);
        this.attackValueText.setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0.5, 0.5);

        this.defenseValueText = this.scene.add.text(35 + 140, 4 + 40 + 12 + 4 + 24 + 4, this.player.config.def, { fontFamily: "Arial", fontSize: 40, color: "#ffffff" });
        this.defenseValueText.setStroke('#444444', 2);
        this.defenseValueText.setShadow(2, 2, "#333333", 2, true, true);
        this.defenseValueText.setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0.5, 0.5);

        this.hpLabelText = this.scene.add.text(35, 4 + 40 + 12 + 4 + 24 + 4 + 12 + 22, 'Hp.', { fontFamily: "Arial", fontSize: 24, color: "#ffffff" });
        this.hpLabelText.setStroke('#444444', 2);
        this.hpLabelText.setShadow(2, 2, "#333333", 2, true, true);
        this.hpLabelText.setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0.5, 0.5);

        var hpText = this.player.config.hp.toString() + ' / ' + this.player.config.maxhp.toString();
        this.hpValueText = this.scene.add.text(35 + 105, 4 + 40 + 12 + 4 + 24 + 4 + 12 + 22, hpText, { fontFamily: "Arial", fontSize: 24, color: "#ffffff" });
        this.hpValueText.setStroke('#444444', 2);
        this.hpValueText.setShadow(2, 2, "#333333", 2, true, true);
        this.hpValueText.setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0.5, 0.5);

        this.hpBarBorder = this.scene.add.rectangle(105, 150, 180, 20);
        this.hpBarBorder.setStrokeStyle(2, 0xffffff);
        this.hpBarBorder.setOrigin(0.5, 0.5);
        this.hpBarBorder.setAlpha(0.75);
        this.hpBarBorder.setScrollFactor(0, 0);
        this.hpBarBorder.setDepth(Constants.Depths.UX);

        this.hpBarValue = this.scene.add.rectangle(17, 150, 175, 16, 0x44bf44);
        this.hpBarValue.setAlpha(0.75);
        this.hpBarValue.setOrigin(0, 0.5);
        this.hpBarValue.setScrollFactor(0, 0);
        this.hpBarValue.setDepth(Constants.Depths.UX);

        this.updateHpBar();

        this.view = this.scene.add.container(0, 0, [this.statsBorder, this.nameText, 
            this.moveLabelText, this.defenseLabelText, this.attackLabelText, 
            this.moveValueText, this.defenseValueText, this.attackValueText,
            this.hpLabelText, this.hpValueText, this.hpBarBorder, this.hpBarValue]);

        this.updateHand();
        this.updateItems();

        this.view.setScrollFactor(0, 0);
        this.view.setDepth(Constants.Depths.UX);
        //this.view.setVisible(false);

        // can set position here because it isn't dependent on player position
        this.view.x = this.x; //10;
        this.view.y = this.y; //Constants.Game.HEIGHT - (210 + 2 + 10);
    }

    setPosition(x, y) {
        this.view.x = x;
        this.view.y = y;
    }

    toggle() {
        if (this.view.visible) {
            this.view.setVisible(false);
        } else {
            this.view.setVisible(true);
        }
    }

    getCards() {
        var cards = [];
        for (var i = 0; i < this.playerCardSprites.length; ++i) {
            cards.push(this.view.getAt(this.view.getIndex(this.playerCardSprites[i])));
        }
        return cards;
    }

    createCardContainer(type, value) {
        var typeStr = '';
        var typeColor = 0x000000;
        if (type == this.CARD_TYPES.ATTACK) {
            typeStr = 'A+';
            typeColor = 0xff0000;
        } else if (type == this.CARD_TYPES.DEFENSE) {
            typeStr = 'D+';
            typeColor = 0xffff00;
        } else if (type == this.CARD_TYPES.TRAP) {
            typeStr = '';
            typeColor = 0x00ff00;
        } else if (type == this.CARD_TYPES.MOVEMENT) {
            typeStr = 'M+';
            typeColor = 0x0000ff;
        }

        var cardRect = this.scene.add.rectangle(0, 0, 35, 40, typeColor);
        cardRect.setStrokeStyle(1, 0x000000);
        cardRect.setAlpha(0.75);
        cardRect.setOrigin(0, 0);
        cardRect.setScrollFactor(0, 0);
        cardRect.setDepth(Constants.Depths.UX_CARD);

        var cardTypeText = this.scene.add.text(17.5, 0, typeStr, 
                            { fontFamily: "Arial", fontSize: 18, color: "#ffffff" });
        cardTypeText.setStroke('#444444', 1);
        cardTypeText.setShadow(1, 1, "#333333", 1, true, true);
        cardTypeText.setScrollFactor(0, 0).setDepth(Constants.Depths.UX_CARD).setOrigin(0.5, 0);

        var cardValueText = this.scene.add.text(17.5, 18, value, 
            { fontFamily: "Arial", fontSize: 18, color: "#ffffff" });
        cardValueText.setStroke('#444444', 1);
        cardValueText.setShadow(1, 1, "#333333", 1, true, true);
        cardValueText.setScrollFactor(0, 0).setDepth(Constants.Depths.UX_CARD).setOrigin(0.5, 0);

        var cardContainer = this.scene.add.container(0, 0, [cardRect, cardTypeText, cardValueText]);
        cardContainer.setDepth(Constants.Depths.UX_CARD);

        return cardContainer;
    }

    updateHand() {
        // should make all cards at the start so we don't 'new' during gameplay
        // that way swapping them can be simple too?

        // must already be present in the container? will this work?
        for (var i = 0; i < this.playerCardSprites.length; ++i) {
            this.view.remove(this.playerCardSprites[i], true);
        }

        // don't want to set on the fly?
        this.playerCardSprites = [];
        for (var i = 0; i < 5; ++i) {
            var carr = this.player.hand[i].split(' ');
            var card = this.createCardContainer(carr[0], carr[1]);
            card.x = 17 + (i * 35);
            card.y = 10 + 150 + 4;
            this.playerCardSprites.push(card);
        }

        // will this work?
        for (var i = 0; i < this.playerCardSprites.length; ++i) {
            this.view.add(this.playerCardSprites[i]);
        }
    }

    updateHpBar() {
        var ratio = (this.player.config.hp / this.player.config.maxhp);
        this.hpBarValue.displayWidth = (176 * ratio);
    }

    updateStats() {
        this.nameText.setText(this.player.config.name);
        var hpText = this.player.config.hp.toString() + ' / ' + this.player.config.maxhp.toString();
        this.hpValueText.setText(hpText);
        this.defenseValueText.setText(this.player.config.def.toString());
        this.attackValueText.setText(this.player.config.atk.toString());
        this.moveValueText.setText(this.player.config.mov.toString());
    }

    updateItems() {
        // remove existing items
        for (var i = 0; i < this.items.length; ++i) {
            this.view.remove(this.items[i], true);
        }

        // add new items
        this.items = [];
        for (var i = 0; i < this.player.config.inv.length; ++i) {
            var itemName = this.player.config.inv[i];

            var item = this.scene.add.image(0, 0, 'items', ItemData[itemName].id + '.png');
            item.x = 35 + ((i % 3) * 70);
            item.y = (Math.floor(i / 3) * 60) + 40 + 24;
            item.setVisible(this.showInventory).setScrollFactor(0, 0).setDepth(Constants.Depths.UX_CARD);

            this.items.push(item);
        }

        // put in
        for (var i = 0; i < this.items.length; ++i) {
            this.view.add(this.items[i]);
        }
    }

    tab() {
        if (this.showInventory) {
            this.showInventory = false;

            for (var i = 0; i < this.items.length; ++i) {
                this.view.getAt(this.view.getIndex(this.items[i])).setVisible(false);
            }
            this.hpBarBorder.setVisible(true);
            this.hpBarValue.setVisible(true);
            for (var i = 0; i < this.playerCardSprites.length; ++i) {
                this.view.getAt(this.view.getIndex(this.playerCardSprites[i])).setVisible(true);
            }
            this.moveLabelText.setVisible(true);
            this.moveValueText.setVisible(true);
            this.attackLabelText.setVisible(true);
            this.attackValueText.setVisible(true);
            this.defenseLabelText.setVisible(true);
            this.defenseValueText.setVisible(true);
            this.hpLabelText.setVisible(true);
            this.hpValueText.setVisible(true);
        } else {
            this.showInventory = true;

            console.log(this.items);
            for (var i = 0; i < this.items.length; ++i) {
                this.view.getAt(this.view.getIndex(this.items[i])).setVisible(true);
            }
            this.hpLabelText.setVisible(false);
            this.hpValueText.setVisible(false);
            this.hpBarBorder.setVisible(false);
            this.hpBarValue.setVisible(false);
            for (var i = 0; i < this.playerCardSprites.length; ++i) {
                this.view.getAt(this.view.getIndex(this.playerCardSprites[i])).setVisible(false);
            }
            this.moveLabelText.setVisible(false);
            this.moveValueText.setVisible(false);
            this.attackLabelText.setVisible(false);
            this.attackValueText.setVisible(false);
            this.defenseLabelText.setVisible(false);
            this.defenseValueText.setVisible(false);
        }
    }

    setPlayer(player) {
        this.player = player;
        this.updateHand();
        this.updateHpBar();
        this.updateStats();
        this.updateItems();
    }
}