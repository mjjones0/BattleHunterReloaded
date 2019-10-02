import Boot from './boot.js';
import Preloader from './preloader.js';
import MainMenu from './menu.js';
import MainGame from './game.js';
import Constants from './constants.js'

const config = {
    type: Phaser.AUTO,
    width: Constants.Game.WIDTH,
    height: Constants.Game.HEIGHT,
    backgroundColor: Constants.Game.BG_COLOR,
    parent: 'game',
    scene: [ Boot, Preloader, MainMenu, MainGame ],
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    }
};

let game = new Phaser.Game(config);