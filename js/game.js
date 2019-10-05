import Constants from './constants.js';
import Utils from './utils.js';
import Sounds from './sounds.js';

export default class MainGame extends Phaser.Scene
{
    constructor ()
    {
        super('MainGame');
    }

    preload () 
    {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/plugins/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });

        Sounds.addMusic('theme_0',          this.sound.add('theme_0'));
        Sounds.addMusic('theme_1',          this.sound.add('theme_1'));
        Sounds.addMusic('theme_2',          this.sound.add('theme_2'));
        Sounds.addSound('ding',             this.sound.add('ding'));
        Sounds.addSound('menu_cancel',      this.sound.add('menu_cancel'));
        Sounds.addSound('menu_confirm',     this.sound.add('menu_confirm'));
        Sounds.addSound('menu_move',        this.sound.add('menu_move'));
        Sounds.addSound('tic_toc_click',    this.sound.add('tic_toc_click'));
        Sounds.addSound('quick_notice',     this.sound.add('quick_notice'));
        Sounds.addSound('med_notice',       this.sound.add('med_notice'));
    }

    init (data)
    {
        console.log("init");
        this.states = {};
        this.states['missionType'] = data.missionType;
    }

    create ()
    {
        this.cameras.main.fadeIn(500);

        this.add.image(Constants.Game.WIDTH / 2, Constants.Game.HEIGHT / 2, 'gamebg')
                    .setScrollFactor(0, 0)
                    .setDepth(Constants.Depths.BACKGROUND);

        var music = 'theme_' + Math.floor(Math.random() * 3).toString();
        this.musicKey = music;
        this.states['theme'] = Constants.Game.THEMES[music];

        // play it as we're fading in but not immediately
        this.time.delayedCall(250, function() {
			Sounds.playMusic(music, true);
        }, [], this);

        this.input.keyboard.on('keydown-ESC', this.back, this);
        
        this.setupBackDialog();

        // make our own handlers because built-in don't like isometric
        this.input.on('pointerdown', this.handleIsometricScenePointerDown, this);

        this.inputEnabled = false;

        this.initPlayer();
        this.changeState(Constants.Game.PLAY_STATES.INTRO);

        this.cursorKeys = this.input.keyboard.createCursorKeys();
    }

    initPlayer()
    {
        this.player = this.add.sprite(0, 0, 'hero', '1.png').setOrigin(0.5, 0.85).setDepth(Constants.Depths.ACTORS);

        // animation
        this.anims.create({key: 'southEast', frames: this.anims.generateFrameNames('hero', {start: 29, end: 32, suffix: '.png'}), 
            frameRate: 6, repeat: 0});
        this.anims.create({key: 'southWest', frames: this.anims.generateFrameNames('hero', {start: 5, end: 8, suffix: '.png'}), 
            frameRate: 6, repeat: 0});
        this.anims.create({key: 'northWest', frames: this.anims.generateFrameNames('hero', {start: 13, end: 16, suffix: '.png'}), 
            frameRate: 6, repeat: 0});
        this.anims.create({key: 'northEast', frames: this.anims.generateFrameNames('hero', {start: 21, end: 24, suffix: '.png'}), 
            frameRate: 6, repeat: 0});

        console.log(this.anims);

        this.player.play('southEast');
    }

    startGame()
    {
        this.state = Constants.Game.PLAY_STATES.INTRO;
        this.tiles = Utils.create2DArray(Constants.Game.ROWS, Constants.Game.COLS);
        this.player.row = Math.floor(Math.random() * Constants.Game.ROWS);
        this.player.col = Math.floor(Math.random() * Constants.Game.COLS);

        this.player.x = this.player.row * Constants.Game.TILE_WIDTH;
        this.player.y = this.player.col * Constants.Game.TILE_HEIGHT;

        this.setupMap();
        this.setupUI();
        this.setupRenderProjection();

        this.cameras.main.setSize(Constants.Game.WIDTH, 
                                  Constants.Game.HEIGHT);

        this.startIntroTransition();
    }

    detectKeyInput() {
        var facing;
    
        if (this.cursorKeys.right.isDown) {
            facing = 'southEast';
        }
        if (this.cursorKeys.down.isDown) {
            facing = 'southWest';
        }
        if (this.cursorKeys.up.isDown) {
            facing = 'northEast';
        }
        if (this.cursorKeys.left.isDown) {
            facing = 'northWest';
        }

        this.animate(facing);
    }

    animate (facing) {
        if (this.player.pathfinding) {
            return;
        }

        if (facing) {
            this.player.facing = facing;
            this.player.play(facing, true);
            this.player.moving = true;
        } else {
            this.player.anims.pause();
            this.player.moving = false;
        }
    }

    startIntroTransition()
    {
        var tweens = this.tweens;
        var scene = this;

        // tween camera around map
        var topTileScroll = this.getScrollForTile(0, 0);
        var rightTileScroll = this.getScrollForTile(Constants.Game.ROWS - 1, 0);
        var downTileScroll = this.getScrollForTile(Constants.Game.ROWS - 1, Constants.Game.COLS - 1);
        var leftTileScroll = this.getScrollForTile(0, Constants.Game.COLS - 1);
        var playerTileScroll = this.getScrollForTile(this.player.row, this.player.col);
        var panCameraRight = {
            targets: this.cameras.main,
            scrollX: {from: topTileScroll.x, to: rightTileScroll.x},
            scrollY: {from: topTileScroll.y, to: rightTileScroll.y},
            duration: 1500
        };
        var panCameraDown = {
            targets: this.cameras.main,
            scrollX: {from: rightTileScroll.x, to: downTileScroll.x},
            scrollY: {from: rightTileScroll.y, to: downTileScroll.y},
            duration: 1500
        };
        var panCameraLeft = {
            targets: this.cameras.main,
            scrollX: {from: downTileScroll.x, to: leftTileScroll.x},
            scrollY: {from: downTileScroll.y, to: leftTileScroll.y},
            duration: 1500
        };
        var panCameraUp = {
            targets: this.cameras.main,
            scrollX: {from: leftTileScroll.x, to: topTileScroll.x},
            scrollY: {from: leftTileScroll.y, to: topTileScroll.y},
            duration: 1500
        };
        var panToPlayer = {
            targets: this.cameras.main,
            scrollX: {from: topTileScroll.x, to: playerTileScroll.x},
            scrollY: {from: topTileScroll.y, to: playerTileScroll.y},
            duration: 1000
        };
        panCameraUp.onComplete = function () {
            tweens.add(panToPlayer);
        }
        panCameraRight.onComplete = function () {
            tweens.add(panCameraDown);
        }
        panCameraDown.onComplete = function () {
            tweens.add(panCameraLeft);
        }
        panCameraLeft.onComplete = function () {
            tweens.add(panCameraUp);
        }
        panToPlayer.onComplete = function () {
            // show summary popup
            scene.summaryFade = scene.add.rectangle(Constants.Game.WIDTH / 2, Constants.Game.HEIGHT / 2, 
                Constants.Game.WIDTH, Constants.Game.HEIGHT, 0x000000);
            scene.summaryFade.setAlpha(0.7);
            scene.summaryFade.setDepth(Constants.Depths.UX);
            scene.summaryFade.setScrollFactor(0, 0);

            // fade in the text
            scene.missionText = scene.add.text(100, Constants.Game.HEIGHT * 0.25, 'Mission Type: ' + scene.states['missionType'], {
                fontSize: '36px', color: '#ffff00'
            }).setDepth(Constants.Depths.UX).setScrollFactor(0, 0).setAlpha(0.0);

            scene.musicText = scene.add.text(100, Constants.Game.HEIGHT * 0.25 + 40, 'Music: ' + scene.states['theme'], {
                fontSize: '36px', color: '#ffff00'
            }).setDepth(Constants.Depths.UX).setScrollFactor(0, 0).setAlpha(0.0);

            scene.tweens.add({
                targets: scene.missionText,
                alpha: {from: 0.0, to: 1.0},
                duration: 300,
                onComplete: function () {
                    scene.time.delayedCall(100, function() {
                        scene.tweens.add({
                            targets: scene.musicText,
                            alpha: {from: 0.0, to: 1.0},
                            duration: 300,
                        })
                    }, [], scene);
                }
            });

            scene.time.delayedCall(150, function() {
                Sounds.playSound('med_notice');
            }, [], scene);

            scene.time.delayedCall(550, function() {
                Sounds.playSound('med_notice');
            }, [], scene);

            scene.time.delayedCall(2300, function() {
                Utils.fadeOutDestroy(scene, scene.summaryFade, 500);
                Utils.fadeOutDestroy(scene, scene.missionText, 500);
                Utils.fadeOutDestroy(scene, scene.musicText, 500);
            }, [], scene);

            // done with intro animations, start the game
            scene.time.delayedCall(2700, function() {
                scene.changeState(Constants.Game.PLAY_STATES.PLAY);
            }, [], scene);
        }
        this.tweens.add(panCameraRight);
    }

    changeState(newState)
    {
        if (newState == Constants.Game.PLAY_STATES.INTRO) {
            this.startGame();
        } else if (newState === Constants.Game.PLAY_STATES.PLAY) {
            this.inputEnabled = true;
            this.nextTurn();
        } else if (newState === Constants.Game.PLAY_STATES.FINISH) {
            this.finish();
        }

        this.state = newState;
    }

    getScrollForTile(row, col) 
    {
        var cartX = row * Constants.Game.TILE_WIDTH;
        var cartY = col * Constants.Game.TILE_HEIGHT;

        // isometric transform
        var scrollX = cartX - cartY;
        var scrollY = (cartX + cartY) / 2;

        // screen transform
        //tile.x += Constants.Game.WIDTH / 2;
        //tile.y += Constants.Game.HEIGHT / 2;

        return { x: scrollX, y: scrollY };
    }

    handleIsometricScenePointerDown(event) 
    {
        if (!this.inputEnabled || this.dialogOpen) {
            //console.log('blocked input');
            return;
        }

        var screenX = event.x + this.cameras.main.scrollX - Constants.Game.WIDTH / 2 + Constants.Game.TILE_WIDTH / 2;
        var screenY = event.y + this.cameras.main.scrollY - Constants.Game.HEIGHT / 2 + Constants.Game.TILE_HEIGHT / 2;
        //console.log(this.cameras.main.scrollX + ", " + this.cameras.main.scrollY);
        var cartXY = Utils.IsometricToCartesian(screenX, screenY);
        var tileX = Math.floor(cartXY.x / Constants.Game.TILE_WIDTH);
        var tileY = Math.floor(cartXY.y / Constants.Game.TILE_HEIGHT);

        //console.log(tileX + ", " + tileY);
        //console.log(screenX + ", " + screenY);

        if (tileX >= 0 && tileX < Constants.Game.ROWS && 
            tileY >= 0 && tileY < Constants.Game.COLS) {
            //console.log(this.tiles);
            //console.log(event);
            //console.log(tileX + ", " + tileY);
            var tile = this.tiles[tileX][tileY];

            var player = this.player;
            //console.log(player.row + ", " + player.col);
            var playerTile = this.tiles[player.row][player.col];

            playerTile.clearTint();
            playerTile.isoZ = 0;

            // prototype effect
            if (tileX == player.row && tileY == player.col) {
                var camera = this.cameras.main;
                var playerTileScroll = this.getScrollForTile(player.row, player.col);
                var panToPlayer = {
                    targets: camera,
                    scrollX: {from: camera.scrollX, to: playerTileScroll.x},
                    scrollY: {from: camera.scrollY, to: playerTileScroll.y},
                    duration: 1000
                };
                this.tweens.add(panToPlayer);
            }

            player.row = tileX;
            player.col = tileY;

            player.x = player.row * Constants.Game.TILE_WIDTH;
            player.y = player.col * Constants.Game.TILE_HEIGHT;

            tile.isoZ = 5;
            tile.setTint(0xff1212);
        }
    }

    generateRandomDungeon()
    {

    }

    setupMap() 
    {
        this.tileGroup = this.add.group();
        var tile;
        for (var row = 0; row < Constants.Game.ROWS; row += 1) {
            for (var col = 0; col < Constants.Game.COLS; col += 1) {
                tile = this.add.sprite(row * Constants.Game.TILE_WIDTH, col * Constants.Game.TILE_HEIGHT, 'tile')
                    .setDepth(Constants.Depths.TILES);
                this.tileGroup.add(tile);
                this.tiles[row][col] = tile;
                tile.isoZ = 0;

                if (row == this.player.row && col == this.player.col) {
                    tile.setTint(0xff1212);
                    tile.isoZ = 5;
                }
            }
        }
    }

    setupUI()
    {
        // top bar
        // deck
        // actions

        // bottom bar
        // player cells
    }

    nextTurn()
    {
        // start timer 

        // get player

        // focus camera on player

    }

    setupRenderProjection ()
    {
        this.game.events.on('prerender', this.projectIsometric, this);
        this.game.events.on('postrender', this.unprojectIsometric, this);
    }

    clearRenderProjection ()
    {
        this.game.events.off('prerender', this.projectIsometric, this);
        this.game.events.off('postrender', this.unprojectIsometric, this);
    }

    clearInputHandlers ()
    {
        this.input.keyboard.off('keydown-ESC', this.back, this);
        this.input.off('pointerdown', this.handlePointerDown, this);
    }

    projectIsometric (renderer, time, delta) {
        var tile;
        for (var xx = 0; xx < Constants.Game.ROWS; xx += 1) {
            for (var yy = 0; yy < Constants.Game.COLS; yy += 1) {
                tile = this.tiles[xx][yy];
                tile.oldX = tile.x;
                tile.oldY = tile.y;
                
                // isometric transform
                tile.x = tile.x - tile.y;
                tile.y = (tile.oldX + tile.y) / 2;

                // screen transform
                tile.x += Constants.Game.WIDTH / 2;
                tile.y += Constants.Game.HEIGHT / 2;

                // fudged Z - inverse because of screen coords
                tile.y -= tile.isoZ;
            }
        }

        this.player.oldX = this.player.x;
        this.player.oldY = this.player.y;

        this.player.x = this.player.x - this.player.y;
        this.player.y = (this.player.oldX + this.player.y) / 2;
        
        this.player.x += Constants.Game.WIDTH / 2;
        this.player.y += Constants.Game.HEIGHT / 2;
    }

    unprojectIsometric (renderer, time, delta) {
        var tile;
        for (var xx = 0; xx < Constants.Game.ROWS; xx += 1) {
            for (var yy = 0; yy < Constants.Game.COLS; yy += 1) {
                tile = this.tiles[xx][yy];
                tile.x = tile.oldX;
                tile.y = tile.oldY;
            }
        }

        this.player.x = this.player.oldX;
        this.player.y = this.player.oldY;
    }

    setupBackDialog () 
    {
        var dialog = this.rexUI.add.dialog({
            x: Constants.Game.WIDTH / 2,
            y: Constants.Game.HEIGHT / 2,

            background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

            content: this.add.text(0, 0, 'Go back to the main menu?', {
                fontSize: '24px'
            }),

            actions: [
                this.createLabel(this, 'Yes'),
                this.createLabel(this, 'No')
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
            // .drawBounds(this.add.graphics(), 0xff0000)
            .popUp(1000);

        var scene = this;
        this.print = this.add.text(0, 0, '');
        dialog
            .on('button.click', function (button, groupName, index, pointer, event) {
                if (index == 0) {
                    this.exitGame();
                    //this.dialogOpen = false;
                } else if (index == 1) {
                    this.dialog.setVisible(false);
                    //this.dialogOpen = false;
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
        
        this.dialog = dialog;
        this.dialog.setVisible(false);
        this.dialog.setScrollFactor(0, 0);
        this.dialog.setDepth(Constants.Depths.UX);
    }

    exitGame ()
    {
        var scene = this;
        this.transitioningOut = true;
        this.dialog.setVisible(false);
        this.tweens.add({
            targets: this.music, 
            volume: 0,
            duration: 500,
            onComplete: function () {
                Sounds.stopMusic(scene.musicKey);
                scene.tweens.killAll();
            }
        });
        this.cameras.main.fadeOut(500);
        this.cameras.main.on('camerafadeoutcomplete', function() {
            this.transitioningOut = false;
            this.clearInputHandlers();
            this.clearRenderProjection();
            this.scene.start('MainMenu');
            this.scene.stop();
        }, this);
    }

    createLabel (scene, text) {
        return scene.rexUI.add.label({
            // width: 40,
            // height: 40,

            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),

            text: scene.add.text(0, 0, text, {
                fontSize: '24px'
            }),

            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        });
    }

    back ()
    {
        if (!this.transitioningOut) {
            this.dialogOpen = true;
            this.dialog.setVisible(true);
        }
    }

    finish() 
    {

    }

    update (time, delta)
    {
        if (this.state === Constants.Game.PLAY_STATES.PLAY) 
        {
            //console.log("updating play");

            // update player input
            this.detectKeyInput();

            var oldX = this.player.x;
            var oldY = this.player.y;

            var dir = this.player.facing;
            if (this.player.moving) {
                if (dir === "northEast") {
                    this.player.y -= delta / 1000 * Constants.Player.SPEED;
                } else if (dir === "northWest") {
                    this.player.x -= delta  / 1000 * Constants.Player.SPEED;
                } else if (dir === "southEast") {
                    this.player.x += delta / 1000 * Constants.Player.SPEED;
                } else if (dir === "southWest") {
                    this.player.y += delta / 1000 * Constants.Player.SPEED;
                }

                // keep in bounds
                if (this.player.x < 0 || this.player.x >= Constants.Game.TILE_WIDTH * Constants.Game.ROWS - 1 ||
                    this.player.y < 0 || this.player.y >= Constants.Game.TILE_HEIGHT * Constants.Game.COLS - 1) {
                    this.player.x = oldX;
                    this.player.y = oldY;
                    console.log("Staying in bounds");
                }
            }   

            // update timer

            // if timer complete, end turn

            // handle result

            // if it leads to action, resolve action

            // if action leads to turn end, end turn
        }
    }
}
