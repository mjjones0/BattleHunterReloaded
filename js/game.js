import Constants from './constants.js';
import Utils from './utils.js';
import Sounds from './sounds.js';
import Player from './entities/player.js';
import Chest from './entities/chest.js';
import Enemy from './entities/enemy.js';
import EnemyData from './enemydata.js';
import Die from './entities/die.js';
import PlayerData from './playerdata.js';
import ItemData from './itemdata.js';
import PlayerStats from './views/playerstats.js';
import BackDialog from './views/backdialog.js';

export default class MainGame extends Phaser.Scene
{
    STATES = {
        INTRO: 0,
        PLAY: 1,
        FINISH: 2
    }

    PLAY_STATES = {
        NO_CONTROL: 0,
        TURN_IDLE: 1,
        SHOW_CARDS: 2,
        SHOW_MOVE_RANGE: 3,
        SHOW_ATTACK_RANGE: 4,
        DEMO: 5
    }

    constructor()
    {
        super('MainGame');
    }

    preload() 
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
        Sounds.addSound('open_sound',       this.sound.add('open_sound'));
        Sounds.addSound('basic_slash',      this.sound.add('basic_slash'));
        Sounds.addSound('bash',             this.sound.add('bash'));
        Sounds.addSound('swing',            this.sound.add('swing'));
        Sounds.addSound('clink',            this.sound.add('clink'));
        Sounds.addSound('heal',             this.sound.add('heal'));
    }

    init(data)
    {
        this.data = {};
        this.data['missionType'] = data.missionType;
    }

    create()
    {
        this.startMusic();
        this.setupEventHandlers();
        this.setupGameState();
        this.setupUX();
        this.setupStateDependentEventHandlers();
    }





    // GAME LOGIC
    
    startMusic() 
    {
        var music = 'theme_' + Math.floor(Math.random() * 3).toString();
        this.musicKey = music;
        this.data['theme'] = Constants.Game.THEMES[music];

        // play it as we're fading in but not immediately
        this.time.delayedCall(250, function() {
			Sounds.playMusic(music, true);
        }, [], this);
    }

    /* To be changed to be state dependent */
    setupEventHandlers()
    {
        this.input.keyboard.on('keydown-ESC', this.back, this);
        this.input.keyboard.on('keydown-A', this.toggleActionUI, this);
        this.input.keyboard.on('keydown-M', this.toggleMovementRange, this);
        this.input.keyboard.on('keydown-D', this.toggleDeckUI, this);
        this.input.keyboard.on('keydown-R', this.testRollDie, this);
        this.input.keyboard.on('keydown-B', this.testBasicAttack, this);
        this.input.keyboard.on('keydown-E', this.testDefend, this);
        this.input.keyboard.on('keydown-T', this.testRest, this);
        this.input.keyboard.on('keydown-P', this.toggleAttackRange, this);
        // make our own handlers because built-in don't like isometric
        this.input.on('pointerdown', this.handleIsometricScenePointerDown, this);
        this.cursorKeys = this.input.keyboard.createCursorKeys();
    }

    setupStateDependentEventHandlers() {
        this.input.keyboard.on('keydown-S', this.playerStatsUI.tab, this.playerStatsUI);
    }

    setupGameState()
    {
        this.tilesArray = this.generateRandomDungeon();
        this.level = {name: 'test', xBorder: this.tilesArray.length, yBorder: this.tilesArray[0].length,
                      data: this.tilesArray, startX: 7, startY: 12};
        this.setupDeck();
        var data = JSON.parse(JSON.stringify(PlayerData.Prototype));
        this.player = new Player(this, -1, -1, this.level, this.cursorKeys, data);
        this.die = new Die(this, Constants.Game.WIDTH / 2, Constants.Game.HEIGHT / 2 - 100, 0.33);
        this.givePlayerHand();
        this.turnTimer = 60.0;
        this.chests = [];
        this.enemies = [];
        this.inputEnabled = false;
        this.changeState(this.STATES.INTRO);
        console.log(PlayerData.Prototype);
        console.log(this.player.config.inv);
    }

    setupUX()
    {
        this.cameras.main.fadeIn(500);
        this.bg = this.add.image(Constants.Game.WIDTH / 2, Constants.Game.HEIGHT / 2, 'gamebg')
                    .setScrollFactor(0, 0)
                    .setDepth(Constants.Depths.BACKGROUND)
                    .setOrigin(0.5, 0.5);

        this.backDialog = new BackDialog(this, Constants.Game.WIDTH / 2, Constants.Game.HEIGHT / 2);
        this.backDialog.setConfirmCallback((function() {
            this.exitGame();
        }).bind(this));
        this.backDialog.setDenyCallback((function() {
            this.backDialog.hide();
        }).bind(this));

        this.setupActionUI();
        this.setupTimerUI();

        this.playerStatsUI = new PlayerStats(this, 10, Constants.Game.HEIGHT - (210 + 2 + 10), this.player);

        this.setupDeckUI();
        this.setupEffects();

        //this.setupSliders();
    }






    startGame()
    {
        this.tiles = Utils.create2DArray(this.level.xBorder, this.level.yBorder);
        this.player.assignTile(this.level.startX, this.level.startY);

        this.setupMap();
        this.setupRenderProjection();

        this.cameras.main.setSize(Constants.Game.WIDTH,
                                  Constants.Game.HEIGHT);

        this.startIntroTransition();
    }

    startIntroTransition()
    {
        var tweens = this.tweens;
        var scene = this;

        // tween camera around map
        var topTileScroll = this.getScrollForTile(0, 0);
        var rightTileScroll = this.getScrollForTile(this.level.xBorder - 1, 0);
        var downTileScroll = this.getScrollForTile(this.level.xBorder - 1, this.level.yBorder - 1);
        var leftTileScroll = this.getScrollForTile(0, this.level.yBorder - 1);
        var playerTileScroll = this.getScrollForTile(this.player.xTile, this.player.yTile);
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
            scene.missionText = scene.add.text(100, Constants.Game.HEIGHT * 0.25, 'Mission Type: ' + scene.data['missionType'], {
                fontSize: '36px', color: '#ffff00',
                strokeThickness: 2,
                shadow: {
                    offsetY:3,
                    blur: 3,
                    fill: true
                }
            }).setDepth(Constants.Depths.UX).setScrollFactor(0, 0).setAlpha(0.0);

            scene.musicText = scene.add.text(100, Constants.Game.HEIGHT * 0.25 + 40, 'Music: ' + scene.data['theme'], {
                fontSize: '36px', color: '#ffff00',
                strokeThickness: 2,
                shadow: {
                    offsetY:3,
                    blur: 3,
                    fill: true
                } 
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
                scene.changeState(this.STATES.PLAY);
            }, [], scene);
        }

        if (Constants.Debug.SKIPINTRO) {
            this.cameras.main.scrollX = playerTileScroll.x;
            this.cameras.main.scrollY = playerTileScroll.y;
            this.changeState(this.STATES.PLAY);
        } else {
            this.tweens.add(panCameraRight);
        }
    }

    givePlayerHand() {
        for (var i = 0; i < 5; ++i) {
            this.player.hand.push(this.deck.pop());
        }
    }

    changeState(newState)
    {
        this.state = newState;

        if (newState == this.STATES.INTRO) {
            this.startGame();
        } else if (newState === this.STATES.PLAY) {
            this.inputEnabled = true;
            this.nextTurn();
        } else if (newState === this.STATES.FINISH) {
            this.finish();
        }
    }

    getScrollForTile(x, y) 
    {
        var cartX = x * Constants.Game.TILE_SIZE;
        var cartY = y * Constants.Game.TILE_SIZE;

        var scrollX = cartX - cartY;
        var scrollY = (cartX + cartY) / 2;

        return { x: scrollX, y: scrollY };
    }

    handleIsometricScenePointerDown(event) 
    {
        if (!this.inputEnabled || this.backDialog.visible()) {
            console.log('blocked input');
            console.log(this.inputEnabled + ", " + this.backDialog.visible());
            return;
        }

        var screenX = event.x + this.cameras.main.scrollX - Constants.Game.WIDTH / 2 + Constants.Game.TILE_SIZE / 2;
        var screenY = event.y + this.cameras.main.scrollY - Constants.Game.HEIGHT / 2 + Constants.Game.TILE_SIZE / 2;
        //console.log(this.cameras.main.scrollX + ", " + this.cameras.main.scrollY);
        var cartXY = Utils.isometricToCartesian(screenX, screenY);
        var tileX = Math.floor(cartXY.x / Constants.Game.TILE_SIZE);
        var tileY = Math.floor(cartXY.y / Constants.Game.TILE_SIZE);

        console.log(tileX + ", " + tileY);
        //console.log(screenX + ", " + screenY);
        console.log(this.level.xBorder + ", " + this.level.yBorder);

        if (tileX >= 0 && tileX < this.level.xBorder && 
            tileY >= 0 && tileY < this.level.yBorder && 
            this.level.data[tileX][tileY]) {
            //console.log(this.tiles);
            //console.log(event);
            //console.log(tileX + ", " + tileY);
            var tile = this.tiles[tileX][tileY];

            var player = this.player;
            //console.log(player.xTile + ", " + player.yTile);
            //var playerTile = this.tiles[player.xTile][player.yTile];

            //playerTile.clearTint();
            //playerTile.isoZ = 0;

            // prototype effect
            /*
            if (tileX == player.xTile && tileY == player.yTile) {
                var camera = this.cameras.main;
                var playerTileScroll = this.getScrollForTile(player.xTile, player.yTile);
                var panToPlayer = {
                    targets: camera,
                    scrollX: {from: camera.scrollX, to: playerTileScroll.x},
                    scrollY: {from: camera.scrollY, to: playerTileScroll.y},
                    duration: 1000
                };
                this.tweens.add(panToPlayer);
            }
            */

            if (this.showingMovementRange) {
                this.toggleMovementRange();
            }

            player.assignTile(tileX, tileY);
            //tile.isoZ = 5;
            //tile.setTint(0xff1212);
        }
    }

    generateRandomDungeon()
    {
        //var tiles = Utils.create2DArray(Constants.Game.X_LEN, Constants.Game.Y_LEN);

        // decide base room size
        //var baseRoomWidth = Math.floor(Math.random() * Constants.Game.X_LEN / 6);
        //var baseRoomHeight = Math.floor(Math.random() * Constants.Game.Y_LEN / 6);

        // pick random number of rooms of random variable sizes near base size
        //var realEstate = Constants.Game.X_LEN * Constants.Game.Y_LEN;

        // we will put the centers of each room in here to help with our DFS alg to connect
        // them
        //var centers = []

        // place them
        // connect them

        var tiles =
        [
        [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
        [1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],
        [1,1,1,2,1,1,1,1,0,1,1,1,1,1,1],
        [1,1,1,1,3,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,3,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,3,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,2,1,1,1,1,0,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1]];

        return tiles;
    }

    inBounds(x, y, level) {
        return x >= 0 && y >= 0 && x < level.xBorder && y < level.yBorder;
    }

    occupiable(x, y) {
        if (this.inBounds(x, y, this.level)) {
            for (var i = 0; i < this.enemies.length; ++i) {
                var enemy = this.enemies[i];
                if (x == enemy.xTile && y == enemy.yTile) {
                    return false;
                }
            }
            return this.tilesArray[x][y] > 0;
        }
        return false;
    }

    attackable(x, y) {
        if (this.inBounds(x, y, this.level)) {
            for (var i = 0; i < this.enemies.length; ++i) {
                var enemy = this.enemies[i];
                if (x == enemy.xTile && y == enemy.yTile) {
                    return true;
                }
            }
            return this.tilesArray[x][y] > 0;
        }
        return false;
    }

    getMovableTilesInRange(range, entity, attacking) {
        var res = [];

        var x = entity.xTile;
        var y = entity.yTile;

        //console.log('entity position: ' + x + ', ' + y);

        var ffpoints = [];
        ffpoints.push([x,y]);

        var visited = Utils.create2DArray(Constants.Game.X_LEN, Constants.Game.Y_LEN);
        for (var i = 0; i < Constants.Game.X_LEN; ++i) {
            for (var j = 0; j < Constants.Game.Y_LEN; ++j) {
                visited[i][j] = false;
            }
        }

        while (ffpoints.length > 0) {
            var p = ffpoints.pop();

            if (!attacking && !this.occupiable(p[0], p[1])) {
                continue;
            }
            if (attacking && !this.attackable(p[0], p[1])) {
                continue;
            }
            if (visited[p[0]][p[1]]) {
                continue;
            }
            if (Math.abs(p[0] - x) + Math.abs(p[1] - y) > range) {
                continue;
            }

            visited[p[0]][p[1]] = true;
            res.push([p[0],p[1]]);

            ffpoints.push([p[0], p[1] - 1]);
            ffpoints.push([p[0], p[1] + 1]);
            ffpoints.push([p[0] + 1, p[1]]);
            ffpoints.push([p[0] - 1, p[1]]);
        }

        return res;
    }

    setupMap() 
    {
        if (this.tilesArray) {
            var tile;
            this.tileGroup = this.add.group();
            for (var xx = 0; xx < this.level.xBorder; xx += 1) {
                for (var yy = 0; yy < this.level.yBorder; yy += 1) {
                    // skip zeroes
                    if (this.tilesArray[xx][yy] == 0) {
                        continue;
                    }

                    tile = this.add.sprite(xx * Constants.Game.TILE_SIZE, yy * Constants.Game.TILE_SIZE, 'autumn')
                        .setDepth(Constants.Depths.TILES)
                        .setOrigin(0.5, 0.25)
                        .setScale(0.64, 0.64);
                    this.tileGroup.add(tile);
                    this.tiles[xx][yy] = tile;
                    tile.isoZ = 0;

                    if (this.tilesArray[xx][yy] == '2') {
                        // random item
                        var idkeys = Object.keys(ItemData);
                        var lootId = idkeys[Utils.getRandomInt(0, idkeys.length - 1)];

                        var chest = new Chest(this, xx, yy, lootId);
                        this.chests.push(chest);
                    }

                    if (this.tilesArray[xx][yy] == '3') {
                        var enemy = new Enemy(this, xx, yy, EnemyData.Slime);
                        this.enemies.push(enemy);
                    }
                }
            }
        }
    }

    nextTurn()
    {
        // start timer 

        // get player

        // focus camera on player

    }

    inMoveRange(x, y) {
        if (this.showingMovementRange) {
            for (var i = 0; i < this.moveRangeTiles.length; ++i) {
                var t = this.moveRangeTiles[i];
                if (x == t[0] && y == t[1]) {
                    return true;
                }
            }
        } 
        return false;
    }

    inAttackRange(x, y) {
        if (this.showingAttackRange) {
            for (var i = 0; i < this.attackRangeTiles.length; ++i) {
                var t = this.attackRangeTiles[i];
                if (x == t[0] && y == t[1]) {
                    return true;
                }
            }
        } 
        return false;
    }

    getTileForEntity(entity)
    {
        var x, y;
        if (entity.destX && entity.destY && entity.xTile && entity.yTile) {
            if (entity.destY < entity.yTile || 
                entity.destX < entity.xTile) {
                x = Math.ceil(entity.x / Constants.Game.TILE_SIZE);
                y = Math.ceil(entity.y / Constants.Game.TILE_SIZE);
            }
        }

        if (!x && !y) {
            x = Math.floor(entity.x / Constants.Game.TILE_SIZE);
            y = Math.floor(entity.y / Constants.Game.TILE_SIZE);
        }

        if (x < this.level.xBorder && y < this.level.yBorder && x >= 0 && y >= 0 && this.level.data[x][y]) {
            return this.tiles[x][y];
        }
        console.log(this.level.data[x][y] + ', ' + this.level.xBorder + ', ' + this.level.yBorder);
        console.log("UH OH STINKY: " + x + ", " + y);
        return null;
    }

    exitGame()
    {
        var scene = this;
        this.transitioningOut = true;
        this.backDialog.hide();
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
            this.resetGame();
            this.scene.stop();
        }, this);
    }

    back()
    {
        if (!this.transitioningOut) {
            this.backDialog.show();
        }
    }

    resetGame() {

    }








    // UX SETUP AND TOGGLES
    setupSliders() 
    {
        const COLOR_LIGHT = 0x7b5e57;
        const COLOR_DARK = 0x260e04;
        var scene = this;
        var print0 = this.add.text(0, 0, '').setDepth(Constants.Depths.UX).setScrollFactor(0, 0);
        var slider = this.rexUI.add.slider({
                x: 200,
                y: 300,
                width: 20,
                height: 200,
                orientation: 'x',

                track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 8, COLOR_DARK),
                thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_LIGHT),

                valuechangeCallback: function (value) {
                    print0.text = value * 4;
                    for (var xx = 0; xx < scene.level.xBorder; xx += 1) {
                        for (var yy = 0; yy < scene.level.yBorder; yy += 1) {
                            if (scene.tiles[xx][yy]) {
                                scene.tiles[xx][yy].setScale(value * 4, value * 4);
                            }
                        }
                    }
                },
                input: 'drag', // 'drag'|'click'
            })
            .layout();

        slider.setDepth(Constants.Depths.UX).setScrollFactor(0, 0).setVisible(true);
    }

    setupDeck() {
        // 12
        this.deck = ['T D', 'T D', 'T D', 'T S', 'T S', 'T S', 'T L', 'T L', 'T L', 'T E', 'T E', 'T E'];
        // 15
        for (var i = 2; i < 10; ++i) {
            if (i < 4) {
                this.deck.push('A ' + i.toString());
                this.deck.push('A ' + i.toString());
                this.deck.push('A ' + i.toString());
            } else if (i < 7) {
                this.deck.push('A ' + i.toString());
                this.deck.push('A ' + i.toString());
            } else {
                this.deck.push('A ' + i.toString());
            }
        }
        // 15
        for (var i = 2; i < 10; ++i) {
            if (i < 4) {
                this.deck.push('D ' + i.toString());
                this.deck.push('D ' + i.toString());
                this.deck.push('D ' + i.toString());
            } else if (i < 7) {
                this.deck.push('D ' + i.toString());
                this.deck.push('D ' + i.toString());
            } else {
                this.deck.push('D ' + i.toString());
            }
        }
        // 12
        for (var i = 1; i < 5; ++i) {
            if (i < 2) {
                this.deck.push('M ' + i.toString());
                this.deck.push('M ' + i.toString());
                this.deck.push('M ' + i.toString());
                this.deck.push('M ' + i.toString());
            } else if (i < 4) {
                this.deck.push('M ' + i.toString());
                this.deck.push('M ' + i.toString());
                this.deck.push('M ' + i.toString());
            } else {
                this.deck.push('M ' + i.toString());
                this.deck.push('M ' + i.toString());
            }
        }

        // randomize!
        this.deck = Utils.shuffle(this.deck);
    }

    setupDeckUI() {
        this.deckIcon = this.add.image(Constants.Game.WIDTH - 90, 10, 'deck')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0, 0);
        
        this.deckText = this.add.text(Constants.Game.WIDTH - 40, 4, this.deck.length.toString(), 
                { fontFamily: "Arial", fontSize: 40, color: "#ffffff" });
        this.deckText.setStroke('#444444', 2);
        this.deckText.setShadow(2, 2, "#333333", 2, true, true);
        this.deckText.setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0.5, 0);
    }

    toggleDeckUI() {
        if (this.showingDeckUI) {
            console.log('showing deck ui');
            this.showingDeckUI = false;
            this.deckIcon.setVisible(false);
            this.deckText.setVisible(false);
        } else {
            console.log('hiding deck ui');
            this.showingDeckUI = true;
            this.deckIcon.setVisible(true);
            this.deckText.setVisible(true);
        }
    }

    setupTimerUI() {
        this.timerText = this.add.text(40, 30, Math.floor(this.turnTimer).toString(), 
                            { fontFamily: "Arial", fontSize: 50, color: "#ffffff" });
        this.timerText.setStroke('#444444', 4);
        this.timerText.setShadow(2, 2, "#333333", 2, true, true);
        this.timerText.setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0.5, 0.5);
    }

    toggleActionUI() {
        if (this.showActionUI) {
            this.showActionUI = false;

            var attackContainer = this.attackContainer;
            var defendContainer = this.defendContainer;
            var moveContainer = this.moveContainer;
            var restContainer = this.restContainer;

            this.tweens.add({
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
            this.tweens.add({
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
            this.tweens.add({
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
            this.tweens.add({
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
        } else {
            this.showActionUI = true;

            this.attackContainer.setVisible(true);
            this.defendContainer.setVisible(true);
            this.moveContainer.setVisible(true);
            this.restContainer.setVisible(true);

            this.tweens.add({
                targets: this.moveContainer,
                x: {from: Constants.Game.WIDTH / 2, to: Constants.Game.WIDTH / 2 - 50},
                y: {from: Constants.Game.HEIGHT / 2, to: Constants.Game.HEIGHT / 2 - 50},
                scaleX: {from: 0.0, to: 1.0},
                scaleY: {from: 0.0, to: 1.0},
                duration: 150
            });
            this.tweens.add({
                targets: this.attackContainer,
                x: {from: Constants.Game.WIDTH / 2, to: Constants.Game.WIDTH / 2 - 50},
                y: {from: Constants.Game.HEIGHT / 2, to: Constants.Game.HEIGHT / 2},
                scaleX: {from: 0.0, to: 1.0},
                scaleY: {from: 0.0, to: 1.0},
                duration: 150,
                onComplete: function() {}
            });
            this.tweens.add({
                targets: this.defendContainer,
                x: {from: Constants.Game.WIDTH / 2, to: Constants.Game.WIDTH / 2 + 50},
                y: {from: Constants.Game.HEIGHT / 2, to: Constants.Game.HEIGHT / 2 - 50},
                scaleX: {from: 0.0, to: 1.0},
                scaleY: {from: 0.0, to: 1.0},
                duration: 150,
                onComplete: function() {}
            });
            this.tweens.add({
                targets: this.restContainer,
                x: {from: Constants.Game.WIDTH / 2, to: Constants.Game.WIDTH / 2 + 50},
                y: {from: Constants.Game.HEIGHT / 2, to: Constants.Game.HEIGHT / 2},
                scaleX: {from: 0.0, to: 1.0},
                scaleY: {from: 0.0, to: 1.0},
                duration: 150,
                onComplete: function() {}
            });
        }
    }

    setupActionUI() {
        var attackBorder = this.add.rectangle(0, 0, 40, 40, 0x321541);
        attackBorder.setStrokeStyle(4, 0xffffff);
        attackBorder.setAlpha(0.75);
        attackBorder.setScrollFactor(0, 0);
        attackBorder.setDepth(Constants.Depths.UX);
        var defendBorder = this.add.rectangle(0, 0, 40, 40, 0x321541);
        defendBorder.setStrokeStyle(4, 0xffffff);
        defendBorder.setAlpha(0.75);
        defendBorder.setScrollFactor(0, 0);
        defendBorder.setDepth(Constants.Depths.UX);
        var moveBorder = this.add.rectangle(0, 0, 40, 40, 0x321541);
        moveBorder.setStrokeStyle(4, 0xffffff);
        moveBorder.setAlpha(0.75);
        moveBorder.setScrollFactor(0, 0);
        moveBorder.setDepth(Constants.Depths.UX);
        var restBorder = this.add.rectangle(0, 0, 40, 40, 0x321541);
        restBorder.setStrokeStyle(4, 0xffffff);
        restBorder.setAlpha(0.75);
        restBorder.setScrollFactor(0, 0);
        restBorder.setDepth(Constants.Depths.UX);

        var attackIcon = this.add.image(0, 0, 'items', ItemData.sword.id + '.png')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.UX);
        var defendIcon = this.add.image(0, 0, 'items', ItemData.wood_shield.id + '.png')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.UX);
        var moveIcon = this.add.image(0, 0, 'items', ItemData.boots.id + '.png')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.UX);
        var restIcon = this.add.image(0, 0, 'items', ItemData.coffee.id + '.png')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.UX);

        this.attackContainer = this.add.container(0, 0, [attackBorder, attackIcon]);
        this.defendContainer = this.add.container(0, 0, [defendBorder, defendIcon]);
        this.moveContainer = this.add.container(0, 0, [moveBorder, moveIcon]);
        this.restContainer = this.add.container(0, 0, [restBorder, restIcon]);

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

    toggleMovementRange() {
        if (this.showingMovementRange) {
            this.showingMovementRange = false;
            for (var i = 0; i < this.moveRangeTiles.length; ++i) {
                var t = this.moveRangeTiles[i];
                //console.log(t);
                var tile = this.tiles[t[0]][t[1]];
                tile.setTint(tile.oldTint);
                tile.setAlpha(tile.oldAlpha);
            }
        } else {
            this.showingMovementRange = true;
            this.moveRangeTiles = this.getMovableTilesInRange(2, this.player, false);
            console.log(this.player.xTile + ', ' + this.player.yTile);
            console.log('tiles');
            console.log(this.moveRangeTiles);
            for (var i = 0; i < this.moveRangeTiles.length; ++i) {
                var t = this.moveRangeTiles[i];
                //  console.log(t[0] + ',' + t[1]);
                var tile = this.tiles[t[0]][t[1]];
                //console.log(this.tiles);
                //console.log(tile);
                tile.oldTint = tile.tint;
                tile.oldAlpha = tile.alpha;
                tile.setTint(0x4e4ac2);
                tile.setAlpha(0.9);
            }
        }
    }

    toggleAttackRange() {
        if (this.showingAttackRange) {
            console.log('hiding attack range');
            this.showingAttackRange = false;
            for (var i = 0; i < this.attackRangeTiles.length; ++i) {
                var t = this.attackRangeTiles[i];
                var tile = this.tiles[t[0]][t[1]];
                tile.setTint(tile.oldTint);
                tile.setAlpha(tile.oldAlpha);
            }
        } else {
            console.log('showing attack range');
            this.showingAttackRange = true;
            this.attackRangeTiles = this.getMovableTilesInRange(1, this.player, true);
            for (var i = 0; i < this.attackRangeTiles.length; ++i) {
                var t = this.attackRangeTiles[i];
                var tile = this.tiles[t[0]][t[1]];
                console.log('tile in attack range: ' + t[0] + ', ' + t[1]);
                tile.oldTint = tile.tint;
                tile.oldAlpha = tile.alpha;
                tile.setTint(0xc24e4a);
                tile.setAlpha(0.9);
            }
        }
    }

    testRollDie() {
        if (!this.rollingDie) {
            this.rollingDie = true;

            var scene = this;
            this.die.roll(50, 2000, 1000, function (result) {
                scene.rollingDie = false;
                console.log(result);
            });
        }
    }





    // EFFECTS

    setupEffects() {
        this.anims.create({key: 'bash', frames: this.anims.generateFrameNames('bash', {start: 0, end: 2, suffix: '.png'}), 
            frameRate: 12, repeat: 0});
        this.slashEffect = this.add.sprite(this, 0, 0, 'bash', '0.png');
        this.slashEffect.setOrigin(0.5, 0.5);
        this.slashEffect.setScrollFactor(0, 0);
        this.slashEffect.setDepth(Constants.Depths.EFFECTS);
        this.slashEffect.setVisible(false);

        this.damageText = this.add.text(0, 0, '0', 
                    { fontFamily: "Arial", fontSize: 32, color: "#ffffff" });
        this.damageText.setStroke('#444444', 2);
        this.damageText.setShadow(2, 2, "#333333", 2, true, true);
        this.damageText.setScrollFactor(0, 0).setDepth(Constants.Depths.EFFECTS).setOrigin(0.5, 0.5);
        this.damageText.setVisible(false);

        this.defendIcon = this.add.image(0, 0, 'items', ItemData.wood_shield.id + '.png')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.EFFECTS).setOrigin(0.5, 0.5);
        this.defendIcon.setVisible(false);

        this.restIcon = this.add.image(0, 0, 'items', ItemData.coffee.id + '.png')
            .setScrollFactor(0, 0).setDepth(Constants.Depths.EFFECTS).setOrigin(0.5, 0.5);
        this.restIcon.setVisible(false);
    }

    playBasicAttack(entity, offsetX, offsetY, onComplete) {
        this.flicker(Phaser.Display.Color.HexStringToColor('#ffffff'), 
                     Phaser.Display.Color.HexStringToColor('#ff0000'), entity, 250);

        var screenCoords = this.getScreenCoordinates(entity);
        this.slashEffect.x = screenCoords.x + offsetX;
        this.slashEffect.y = screenCoords.y + offsetY;
        console.log('Playing animation at: ' + this.slashEffect.x + ', ' + this.slashEffect.y);
        console.log('Camera Scroll: ' + this.cameras.main.scrollX + ', ' + this.cameras.main.scrollY);
        this.slashEffect.setVisible(true);
        this.slashEffect.play('bash');
        Sounds.playSound('bash');
        this.slashEffect.on('animationcomplete', onComplete, this);
    }

    playDefendEffect(entity, offsetX, offsetY, onComplete) {
        this.flicker(Phaser.Display.Color.HexStringToColor('#ffffff'), 
                     Phaser.Display.Color.HexStringToColor('#ffff00'), entity, 400);

        var screenCoords = this.getScreenCoordinates(entity);
        this.defendIcon.x = screenCoords.x + offsetX;
        this.defendIcon.y = screenCoords.y + offsetY;
        this.defendIcon.setVisible(true);
        
        Sounds.playSound('clink');

        this.tweens.add({
            targets: this.defendIcon,
            y: {from: this.defendIcon.y, to: this.defendIcon.y - 100},
            alpha: {from: 1.0, to: 0.0},
            duration: 400,
            onComplete: onComplete
        });
    }

    playRestEffect(entity, offsetX, offsetY, onComplete) {
        this.flicker(Phaser.Display.Color.HexStringToColor('#ffffff'), 
                     Phaser.Display.Color.HexStringToColor('#00ff00'), entity, 400);

        var screenCoords = this.getScreenCoordinates(entity);
        this.restIcon.x = screenCoords.x + offsetX;
        this.restIcon.y = screenCoords.y + offsetY;
        this.restIcon.setVisible(true);
        
        Sounds.playSound('heal');

        this.tweens.add({
            targets: this.restIcon,
            y: {from: this.restIcon.y, to: this.restIcon.y - 100},
            alpha: {from: 1.0, to: 0.0},
            duration: 400,
            onComplete: onComplete
        });
    }

    flicker(startTint, endTint, entity, duration) {
        this.tweenStep = 0;
        var scene = this;
        this.tweens.add({
            targets: this,
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

    playDamageNumberEffect(xamp, yamp, scale, color, entity, offsetX, offsetY, duration, reverseMove, value, oncomplete) {
        this.damageText.setVisible(true);
        this.damageText.setText(value.toString());
        this.damageText.setScale(scale, scale);
        var screenCoords = this.getScreenCoordinates(entity);
        this.damageText.x = screenCoords.x + offsetX;
        this.damageText.y = screenCoords.y + offsetY;
        this.damageText.setTint(color);

        var from = {x: (reverseMove ? this.damageText.x + xamp : this.damageText.x), 
                    y: (reverseMove ? this.damageText.y + yamp : this.damageText.y)};
        var to = {x: (reverseMove ? this.damageText.x : this.damageText.x + xamp), 
                  y: (reverseMove ? this.damageText.y : this.damageText.y + yamp)};

        this.tweens.add({
            targets: this.damageText,
            x: {from: from.x, to: to.x},
            y: {from: from.y, to: to.y},
            alpha: {from: 1.0, to: 0.0},
            repeat: 0,
            duration: duration,
            onComplete: oncomplete
        });
    }

    testBasicAttack() {
        if (!this.testingBasicAttack) {
            this.testingBasicAttack = true;

            this.playBasicAttack(this.enemies[0], 0, -20, function(animation, frame) {
                this.slashEffect.setVisible(false);

                var scene = this;
                this.playDamageNumberEffect(0, -100, 1.0, 0xffff00, this.enemies[0], 0, -20, 500, false, '10', 
                function () {
                    scene.testingBasicAttack = false;
                    scene.damageText.setVisible(false);
                });
            });
        }
    }

    testDefend() {
        if (!this.testingDefend) {
            this.testingDefend = true;

            var scene = this;
            this.playDefendEffect(this.enemies[0], 0, -20, function(animation, frame) {
                scene.defendIcon.setVisible(false);
                scene.testingDefend = false;

                /*
                var scene = this;
                this.playDamageNumberEffect(0, -100, 1.0, 0xffff00, this.enemies[0], 0, -20, 500, '10', function () {
                    scene.testingDefend = false;
                    scene.damageText.setVisible(false);
                });
                */
            });
        }
    }

    testRest() {
        if (!this.testingRest) {
            this.testingRest = true;

            var scene = this;
            this.playRestEffect(this.enemies[0], 0, -20, function(animation, frame) {
                scene.restIcon.setVisible(false);
                scene.playDamageNumberEffect(0, 80, 1.0, 0x00ff00, scene.enemies[0], 0, -80, 400, true, 
                    Math.floor(scene.player.config.maxhp / 4).toString(), 
                    function () {
                        scene.testingRest = false;
                        scene.damageText.setVisible(false);
                    }
                );
            });
        }
    }





    // RENDERING

    setupRenderProjection()
    {
        this.game.events.on('prerender', this.projectIsometric, this);
        this.game.events.on('postrender', this.unprojectIsometric, this);
    }

    clearRenderProjection()
    {
        this.game.events.off('prerender', this.projectIsometric, this);
        this.game.events.off('postrender', this.unprojectIsometric, this);
    }

    clearInputHandlers()
    {
        this.input.keyboard.off('keydown-ESC', this.back, this);
        this.input.off('pointerdown', this.handlePointerDown, this);
    }

    depthSort() {
        for (var i = 0; i < this.chests.length; ++i) {
            var chest = this.chests[i];
            if (!chest.alive) {
                continue;
            }
            chest.setDepth(Constants.Depths.ACTORS + chest.y);
        }

        for (var i = 0; i < this.enemies.length; ++i) {
            var enemy = this.enemies[i];
            if (!enemy.alive) {
                continue;
            }
            enemy.setDepth(Constants.Depths.ACTORS + enemy.y);
        }

        this.player.setDepth(Constants.Depths.ACTORS + this.player.y);
    }

    getIsoCoordinates(x, y) {
        var screenX = x - y;
        var screenY = (x + y) / 2;

        return {x: screenX, y: screenY};
    }

    getScreenCoordinates(entity) {
        var camera = this.cameras.main;
        var screenX = entity.x - entity.y + Constants.Game.WIDTH / 2 - camera.scrollX;
        var screenY = (entity.x + entity.y) / 2 + Constants.Game.HEIGHT / 2 - camera.scrollY;
        return {x: screenX, y: screenY};
    }

    projectIsometric() {
        var tile;
        for (var xx = 0; xx < this.level.xBorder; xx += 1) {
            for (var yy = 0; yy < this.level.yBorder; yy += 1) {
                if (!this.tilesArray[xx][yy]) {
                    continue;
                }
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

        for (var i = 0; i < this.chests.length; ++i) {
            var chest = this.chests[i];
            chest.oldX = chest.x;
            chest.oldY = chest.y;

            chest.x = chest.x - chest.y;
            chest.y = (chest.oldX + chest.y) / 2;
            
            chest.x += Constants.Game.WIDTH / 2;
            chest.y += Constants.Game.HEIGHT / 2;
        }

        for (var i = 0; i < this.enemies.length; ++i) {
            var enemy = this.enemies[i];
            enemy.oldX = enemy.x;
            enemy.oldY = enemy.y;

            enemy.x = enemy.x - enemy.y;
            enemy.y = (enemy.oldX + enemy.y) / 2;
            
            enemy.x += Constants.Game.WIDTH / 2;
            enemy.y += Constants.Game.HEIGHT / 2;
        }

        this.player.oldX = this.player.x;
        this.player.oldY = this.player.y;

        this.player.x = this.player.x - this.player.y;
        this.player.y = (this.player.oldX + this.player.y) / 2;
        
        this.player.x += Constants.Game.WIDTH / 2;
        this.player.y += Constants.Game.HEIGHT / 2;

        this.depthSort();
    }

    unprojectIsometric() {
        var tile;
        for (var xx = 0; xx < this.level.xBorder; xx += 1) {
            for (var yy = 0; yy < this.level.yBorder; yy += 1) {
                if (!this.tilesArray[xx][yy]) {
                    continue;
                }
                tile = this.tiles[xx][yy];
                tile.x = tile.oldX;
                tile.y = tile.oldY;
            }
        }

        for (var i = 0; i < this.chests.length; ++i) {
            var chest = this.chests[i];
            chest.x = chest.oldX;
            chest.y = chest.oldY;
        }

        for (var i = 0; i < this.enemies.length; ++i) {
            var enemy = this.enemies[i];
            enemy.x = enemy.oldX;
            enemy.y = enemy.oldY;
        }

        this.player.x = this.player.oldX;
        this.player.y = this.player.oldY;
    }

    /* #endregion */





    // UPDATE FUNCTIONS

    update(time, delta)
    {
        if (this.state === this.STATES.PLAY) 
        {
            if (!this.backDialog.visible()) {
                this.updateTimer(delta);
                this.player.update(delta);
                this.die.update(delta);
                this.updateRangeMove();
                this.updateAttackRange();
                var playerScroll = this.getIsoCoordinates(this.player.x, this.player.y);
                this.cameras.main.setScroll(playerScroll.x, playerScroll.y);
                this.updateChests();
                this.updateEnemies();
                // this.highlightMap(delta);
            }
        }
    }

    updateDeck() {
        this.deckText.setText(this.deck.length);
    }

    updateRangeMove() {
        if (!this.showingMovementRange) {
            return;
        }

        var safe = true;

        if (this.player.state == this.player.STATES.PATHFINDING) {
            safe = false;
            for (var i = 0; i < this.moveRangeTiles.length; ++i) {
                if (this.player.destX == this.moveRangeTiles[i][0] &&
                    this.player.destY == this.moveRangeTiles[i][1]) {
                    safe = true;
                }
            }
        }

        if (!safe) {
            this.player.runIntoObstacle();
        }
    }

    updateAttackRange() {
        if (!this.showingAttackRange) {
            return;
        }
    }

    updateTimer(delta) {
        this.turnTimer -= (delta / 1000);
        if (this.turnTimer <= 0) {
            this.turnTimer = 60.0;
        }

        if (this.turnTimer < 10) {
            this.timerText.setTint(0xff0000);
        } else if (this.turnTimer < 20) {
            this.timerText.setTint(0xff7700);
        } else if (this.turnTimer < 30) {
            this.timerText.setTint(0xffff00);
        } else {
            this.timerText.clearTint();
        }

        this.timerText.setText(Math.floor(this.turnTimer).toString());
    }

    updateChests() {
        // if we're trying to move into a chest, then we want to stop our movement
        // basically and instead open the chest
        var scene = this;
        for (var i = 0; i < this.chests.length; ++i) {
            var chest = this.chests[i];

            if (this.player.state == this.player.STATES.PATHFINDING && 
                chest.alive && 
                this.player.destX == chest.xTile &&
                this.player.destY == chest.yTile) {
                    for (var i = 0; i < this.enemies.length; ++i) {
                        var enemy = this.enemies[i];
                        console.log(enemy.x + ', ' + enemy.y);
                    }
                var player = this.player;
                var onComplete = function () {
                    Sounds.playSound('ding');
                    player.finishChest();
                    scene.playerStatsUI.updateItems();
                };
                chest.open(player, onComplete);
                player.openChest();
            }
        }
    }

    updateEnemies() {
        for (var i = 0; i < this.enemies.length; ++i) {
            var enemy = this.enemies[i];

            if (this.player.state == this.player.STATES.PATHFINDING && 
                enemy.alive && 
                this.player.destX == enemy.xTile &&
                this.player.destY == enemy.yTile) {
                this.player.runIntoObstacle();
            }
        }
    }
}
