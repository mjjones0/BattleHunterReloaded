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
import Effects from './effects/effects.js';
import Actions from './views/actions.js';
import Timer from './views/timer.js';
import IsometricRender from './systems/isometricrender.js';
import Deck from './views/deck.js';

export default class MainGame extends Phaser.Scene
{
    SCENE_STATES = {
        INTRO: 0,
        PLAY: 1,
        FINISH: 2
    }

    TURN_STATES = {
        TURN_IDLE: 1,
        SHOW_CARDS: 2,
        SHOW_MOVE_RANGE: 3,
        SHOW_ATTACK_RANGE: 4
    }

    constructor()
    {
        super('MainGame');
    }

    preload() 
    {
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
        this.cameras.main.setSize(Constants.Game.WIDTH, Constants.Game.HEIGHT);

        this.createInputHandlers();
        this.createGameState();
        this.createView();
        this.createStateDependentInputHandlers();

        this.changeSceneState(this.SCENE_STATES.INTRO);
    }

    createInputHandlers()
    {
        this.input.keyboard.on('keydown-ESC', this.toggleBackDialog, this);
        this.input.keyboard.on('keydown-A', this.toggleActionUI, this);
        this.input.keyboard.on('keydown-M', this.toggleMovementRange, this);
        this.input.keyboard.on('keydown-P', this.toggleAttackRange, this);

        this.input.keyboard.on('keydown-R', this.testRollDie, this);
        this.input.keyboard.on('keydown-B', this.testBasicAttack, this);
        this.input.keyboard.on('keydown-E', this.testDefend, this);
        this.input.keyboard.on('keydown-T', this.testRest, this);

        //this.input.on('pointerdown', this.handleIsometricScenePointerDown, this);
        this.cursorKeys = this.input.keyboard.createCursorKeys();
    }

    createGameState()
    {
        // create dungeon things
        this.tilesArray = this.generateRandomDungeon();
        this.level = {name: 'test', xBorder: this.tilesArray.length, yBorder: this.tilesArray[0].length,
                      data: this.tilesArray, startX: 7, startY: 12};
        this.tiles = Utils.create2DArray(this.level.xBorder, this.level.yBorder);
        this.chests = [];
        this.enemies = [];
        this.createDungeonEntities();

        // create the player
        this.player = new Player(this, -1, -1, this.level, this.cursorKeys, 
            JSON.parse(JSON.stringify(PlayerData.Prototype)));
        this.die = new Die(this, Constants.Game.WIDTH / 2, Constants.Game.HEIGHT / 2 - 100, 0.33);

        // create the deck now that we have all the entities that will be projected
        this.createProjector();

        // create the deck and the hand for the player, since these will be visible while transitioning in
        this.createDeck();
        for (var i = 0; i < 5; ++i) {
            this.player.hand.push(this.deck.pop());
        }
    }

    createDungeonEntities() 
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

                    tile = this.add.sprite(xx * Constants.Game.TILE_SIZE, yy * Constants.Game.TILE_SIZE, 'yellow')
                        .setDepth(Constants.Depths.TILES)
                        .setOrigin(0.5, 0.25)
                        .setScale(0.64, 0.64);
                    this.tileGroup.add(tile);
                    this.tiles[xx][yy] = tile;
                    tile.noDepthSort = true;
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

    createProjector() {
        this.renderer = new IsometricRender();
        var tile;
        for (var xx = 0; xx < this.level.xBorder; xx += 1) {
            for (var yy = 0; yy < this.level.yBorder; yy += 1) {
                if (!this.tilesArray[xx][yy]) {
                    continue;
                }
                tile = this.tiles[xx][yy];
                this.renderer.addEntity(tile);
            }
        }
        this.renderer.addEntities(this.enemies);
        this.renderer.addEntities(this.chests);
        this.renderer.addEntity(this.player);
        this.renderer.bind(this);
    }

    createDeck() {
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

    createView()
    {
        this.bg = this.add.image(Constants.Game.WIDTH / 2, Constants.Game.HEIGHT / 2, 'gamebg')
                    .setScrollFactor(0, 0)
                    .setDepth(Constants.Depths.BACKGROUND)
                    .setOrigin(0.5, 0.5);

        this.backDialog = new BackDialog(this, Constants.Game.WIDTH / 2, Constants.Game.HEIGHT / 2, this.hideBackDialog.bind(this), this.exitGame.bind(this));

        this.actionsUI = new Actions(this);
        this.actionsUI.create();

        this.turnTimerUI = new Timer(this, 40, 30, 60);
        this.turnTimerUI.create();

        this.playerStatsUI = new PlayerStats(this, 10, Constants.Game.HEIGHT - (210 + 2 + 10), this.player);

        this.deckUI = new Deck(this, 54);
        this.deckUI.create();
        this.deckUI.update(this.deck);

        this.effects = new Effects(this);
        this.effects.create();
    }

    createStateDependentInputHandlers() {
        this.input.keyboard.on('keydown-S', this.playerStatsUI.tab, this.playerStatsUI);
    }




    // STATE MACHINE
    changeSceneState(newSceneState)
    {
        this.sceneState = newSceneState;

        if (newSceneState == this.SCENE_STATES.INTRO) {
            // disable input
            this.inputEnabled = false;

            // fade in the camera
            this.cameras.main.fadeIn(500);

            // start music
            var music = 'theme_' + Math.floor(Math.random() * 3).toString();
            this.musicKey = music;
            this.data['theme'] = Constants.Game.THEMES[music];
            this.time.delayedCall(250, function() {
                Sounds.playMusic(music, true);
            }, [], this);

            // put the player in position
            this.player.assignTile(this.level.startX, this.level.startY);

            // play the opening transition
            this.playIntroTransition();
        } else if (newSceneState === this.SCENE_STATES.PLAY) {
            this.inputEnabled = true;
            this.nextTurn();
        } else if (newSceneState === this.SCENE_STATES.FINISH) {
            this.finish();
        }
    }

    playIntroTransition()
    {
        var tweens = this.tweens;
        var scene = this;

        // tween camera around map
        var topTileScroll = Utils.getScrollForTile(0, 0, Constants.Game.TILE_SIZE);
        var rightTileScroll = Utils.getScrollForTile(this.level.xBorder - 1, 0, Constants.Game.TILE_SIZE);
        var downTileScroll = Utils.getScrollForTile(this.level.xBorder - 1, this.level.yBorder - 1, Constants.Game.TILE_SIZE);
        var leftTileScroll = Utils.getScrollForTile(0, this.level.yBorder - 1, Constants.Game.TILE_SIZE);
        var playerTileScroll = Utils.getScrollForTile(this.player.xTile, this.player.yTile, Constants.Game.TILE_SIZE);
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
                scene.changeSceneState(this.SCENE_STATES.PLAY);
            }, [], scene);
        }

        if (Constants.Debug.SKIPINTRO) {
            this.cameras.main.scrollX = playerTileScroll.x;
            this.cameras.main.scrollY = playerTileScroll.y;
            this.changeSceneState(this.SCENE_STATES.PLAY);
        } else {
            this.tweens.add(panCameraRight);
        }
    }

    nextTurn()
    {
        // start timer 
        this.turnTimerUI.start();

        // get player
        this.controllingEntity = this.player;// this.turnOrder.pop();
        var entityTileScroll = Utils.getScrollForTile(this.controllingEntity.xTile, this.controllingEntity.yTile, Constants.Game.TILE_SIZE);

        // focus camera on player
        this.cameras.main.scrollX = entityTileScroll.x;
        this.cameras.main.scrollY = entityTileScroll.y;

        // startTurnState
        this.changeTurnState(this.TURN_STATES.TURN_IDLE);
    }

    changeTurnState(turnState) {
        this.turnState = turnState;

        switch (this.turnState) {
            case this.TURN_STATES.TURN_IDLE:
                // show actions UI
                this.showActionUI = true;
                this.actionsUI.show();
                break;
            case this.TURN_STATES.SHOW_CARDS:
                // show card selection UI

                break;
            case this.TURN_STATES.SHOW_MOVE_RANGE:
                // show move range 

                break;
            case this.TURN_STATES.SHOW_ATTACK_RANGE:
                // show attack range 

                break;
        }
    }

    endTurn() {
        this.nextTurn();
    }

    finish() {
        // show a summary animation

        // exit back to main menu
        this.exitGame();
    }

    exitGame()
    {
        console.log("Exiting game!");
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

            this.renderer.unbind(this);

            //this.clearRenderProjection();
            this.scene.start('MainMenu');
            this.scene.stop();
        }, this);
    }

    clearInputHandlers()
    {
        this.input.keyboard.off('keydown-ESC', this.back, this);
        this.input.off('pointerdown', this.handlePointerDown, this);
    }


    // STATE MACHINE INPUT HANDLERS
    handleIsometricScenePointerDown(event) 
    {
        if (!this.inputEnabled) {
            console.log('blocked input');
            return;
        }

        var screenX = event.x + this.cameras.main.scrollX - Constants.Game.WIDTH / 2 + Constants.Game.TILE_SIZE / 2;
        var screenY = event.y + this.cameras.main.scrollY - Constants.Game.HEIGHT / 2 + Constants.Game.TILE_SIZE / 2;
        var cartXY = Utils.isometricToCartesian(screenX, screenY);
        var tileX = Math.floor(cartXY.x / Constants.Game.TILE_SIZE);
        var tileY = Math.floor(cartXY.y / Constants.Game.TILE_SIZE);

        if (tileX >= 0 && tileX < this.level.xBorder && 
            tileY >= 0 && tileY < this.level.yBorder && 
            this.level.data[tileX][tileY]) {
            var player = this.player;
            if (this.showingMovementRange) {
                this.toggleMovementRange();
            }
            player.assignTile(tileX, tileY);
        }
    }


    // UPDATE STATE MACHINE
    update(time, delta)
    {
        if (this.sceneState === this.SCENE_STATES.PLAY) 
        {
            if (!this.backDialog.visible()) {
                this.turnTimerUI.update(delta);
                this.player.update(delta);
                this.die.update(delta);
                this.updateRangeMove();
                this.updateAttackRange();
                var playerScroll = Utils.getIsoCoordinates(this.player.x, this.player.y);
                this.cameras.main.setScroll(playerScroll.x, playerScroll.y);
                this.updateChests();
                this.updateEnemies();
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

    updateChests() {
        // if we're trying to move into a chest, then we want to stop our movement
        // basically and instead open the chest
        var scene = this;
        for (var i = 0; i < this.chests.length; ++i) {
            var chest = this.chests[i];

            if (this.player.state == this.player.STATES.PATHFINDING && chest.alive && 
                this.player.destX == chest.xTile && this.player.destY == chest.yTile) {
                //for (var i = 0; i < this.enemies.length; ++i) {
                //    var enemy = this.enemies[i];
                //}
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



    // LEVEL UTILITY FUNCTIONS
    generateRandomDungeon()
    {
        var tiles =
        [
        [1,1,1,1,1,1,0,0,1,1,1,1,1,1],
        [1,1,1,1,1,1,0,0,1,1,1,1,1,1],
        [1,1,2,1,1,1,0,0,1,1,1,1,1,1],
        [1,1,1,3,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,3,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,3,1,1,1,1,1,1,1,1,1,1],
        [1,1,2,1,1,1,0,0,1,1,1,1,1,1],
        [1,1,1,1,1,1,0,0,1,1,1,1,1,1],
        [1,1,1,1,1,1,0,0,1,1,1,1,1,1],
        [1,1,1,1,1,1,0,0,1,1,1,1,1,1]];

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



    // toggles for UI testing
    toggleActionUI() {
        if (this.showActionUI) {
            this.showActionUI = false;
            this.actionsUI.hide();
        } else {
            this.showActionUI = true;
            this.actionsUI.show();
        }
    }

    toggleMovementRange() {
        if (this.showingMovementRange) {
            this.showingMovementRange = false;
            for (var i = 0; i < this.moveRangeTiles.length; ++i) {
                var t = this.moveRangeTiles[i];
                var tile = this.tiles[t[0]][t[1]];
                tile.setTint(tile.oldTint);
                tile.setAlpha(tile.oldAlpha);
            }
        } else {
            this.showingMovementRange = true;
            this.moveRangeTiles = this.getMovableTilesInRange(2, this.player, false);
            for (var i = 0; i < this.moveRangeTiles.length; ++i) {
                var t = this.moveRangeTiles[i];
                var tile = this.tiles[t[0]][t[1]];
                tile.oldTint = tile.tint;
                tile.oldAlpha = tile.alpha;
                tile.setTint(0x4e4ac2);
                tile.setAlpha(0.9);
            }
        }
    }

    toggleAttackRange() {
        if (this.showingAttackRange) {
            this.showingAttackRange = false;
            for (var i = 0; i < this.attackRangeTiles.length; ++i) {
                var t = this.attackRangeTiles[i];
                var tile = this.tiles[t[0]][t[1]];
                tile.setTint(tile.oldTint);
                tile.setAlpha(tile.oldAlpha);
            }
        } else {
            this.showingAttackRange = true;
            this.attackRangeTiles = this.getMovableTilesInRange(1, this.player, true);
            for (var i = 0; i < this.attackRangeTiles.length; ++i) {
                var t = this.attackRangeTiles[i];
                var tile = this.tiles[t[0]][t[1]];
                tile.oldTint = tile.tint;
                tile.oldAlpha = tile.alpha;
                tile.setTint(0xc24e4a);
                tile.setAlpha(0.9);
            }
        }
    }

    toggleBackDialog()
    {
        if (!this.transitioningOut) {
            this.backDialog.show();
        }
    }


    hideBackDialog() {
        console.log("Hiding back dialog!");
        this.backDialog.hide();
    }



    // testing the effects
    testBasicAttack() {
        if (!this.testingBasicAttack) {
            this.testingBasicAttack = true;

            var damageStr = (10).toString();
            var effects = this.effects;
            var entity = this.enemies[0];
            var scene = this;

            effects.playBasicAttack(entity, 0, -20, function () {
                effects.playDamageNumberEffect(entity, damageStr, 
                    effects.CONFIGS.BASIC_ATTACK_NORMAL_DAMAGE_TEXT, function () {
                    scene.testingBasicAttack = false;
                });
            });
        }
    }

    testDefend() {
        if (!this.testingDefend) {
            this.testingDefend = true;

            var scene = this;
            this.effects.playDefendEffect(this.enemies[0], 0, -20, function() {
                scene.testingDefend = false;
            });
        }
    }

    testRest() {
        if (!this.testingRest) {
            this.testingRest = true;

            var scene = this;
            var entity = this.enemies[0];
            var effects = this.effects;
            effects.playRestEffect(entity, 0, -20, function() {
                var healingNumber = Math.floor(scene.player.config.maxhp / 4).toString();
                effects.playDamageNumberEffect(entity, healingNumber, 
                effects.CONFIGS.REST_HEALING_TEXT,
                    function () {
                        scene.testingRest = false;
                    }
                );
            });
        }
    }

    testRollDie() {
        if (!this.rollingDie) {
            this.rollingDie = true;

            var scene = this;
            this.die.roll(50, 1000, 1000, function (result) {
                scene.rollingDie = false;
            });
        }
    }
}
