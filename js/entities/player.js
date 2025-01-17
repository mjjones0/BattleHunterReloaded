import Constants from '../constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite
{
    STATES = {
        IDLE: 0,
        PATHFINDING: 1,
        OPENING: 2,
        MENU: 3
    };

    constructor (scene, x, y, level, cursorKeys, data) {
        super(scene, x, y, 'hero', '1.png');
				
        this.setOrigin(0.5, 0.85);
        this.setDepth(Constants.Depths.ACTOR)

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.destX = this.tileX;
        this.destY = this.tileY;
        this.moving = false;
        this.pathfinding = false;
        this.facing = 'southEast';
        this.state = this.STATES.IDLE;
        this.cursorKeys = cursorKeys;
        this.scene = scene;
        this.cd = 0;
        this.config = data;
        this.hand = [];

        this.setLevel(level);
        this.assignTile(x, y);

        this.path = [];

        this.isAlive = true;

        this.spacebar = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.up = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.down = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        this.createAnimations(scene);
    }

    setLevel(level) {
        this.level = level;
    }

    assignTile(x, y) {
        console.log("assign tile: " + x + ", " + y);
        if (x < 0 && y < 0) {
            this.xTile = Math.floor(Math.random() * this.level.xBorder);
            this.yTile = Math.floor(Math.random() * this.level.yBorder);
            this.x = this.xTile * Constants.Game.TILE_SIZE;
            this.y = this.yTile * Constants.Game.TILE_SIZE;
        } else if (x < this.level.xBorder && y < this.level.yBorder) {
            this.xTile = x;
            this.yTile = y;
            this.x = this.xTile * Constants.Game.TILE_SIZE;
            this.y = this.yTile * Constants.Game.TILE_SIZE;
        }
    }

    createAnimations(scene) {
        scene.anims.create({key: 'southEast', frames: scene.anims.generateFrameNames('hero', {start: 29, end: 32, suffix: '.png'}), 
            frameRate: 6, repeat: 0});
        scene.anims.create({key: 'southWest', frames: scene.anims.generateFrameNames('hero', {start: 5, end: 8, suffix: '.png'}), 
            frameRate: 6, repeat: 0});
        scene.anims.create({key: 'northWest', frames: scene.anims.generateFrameNames('hero', {start: 13, end: 16, suffix: '.png'}), 
            frameRate: 6, repeat: 0});
        scene.anims.create({key: 'northEast', frames: scene.anims.generateFrameNames('hero', {start: 21, end: 24, suffix: '.png'}), 
            frameRate: 6, repeat: 0});

        this.play('southEast');
        this.anims.pause();
    }

    getMovingDirection() {
        if (this.cursorKeys.right.isDown) {
            return 'southEast';
        }
        if (this.cursorKeys.down.isDown) {
            return 'southWest';
        }
        if (this.cursorKeys.up.isDown) {
            return 'northEast';
        }
        if (this.cursorKeys.left.isDown) {
            return 'northWest';
        }

        return null;
    }

    setDestination(destX, destY)
    {
        if (destX < 0 || destX > this.level.xBorder || destY < 0 || destY > this.level.yBorder) {
            return;
        }

        if (this.state != this.STATES.PATHFINDING) {
            this.state = this.STATES.PATHFINDING;
            this.destX = destX;
            this.destY = destY;
            this.path = this.determinePath();
        }
    }

    tryStartPathFinding(facing) {
        var xBorder = this.level.xBorder - 1;
        var yBorder = this.level.yBorder - 1;

        if (facing === "southEast" && this.xTile < xBorder) {
            this.destX = this.xTile + 1;
            this.destY = this.yTile;
        } else if (facing === "northEast" && this.yTile >= 0) {
            this.destX = this.xTile;
            this.destY = this.yTile - 1;
        } else if (facing === "northWest" && this.xTile >= 0) {
            this.destX = this.xTile - 1;
            this.destY = this.yTile;
        } else if (facing === "southWest" && this.yTile < yBorder) {
            this.destX = this.xTile;
            this.destY = this.yTile + 1;
        }

        if (this.destX < 0 || this.destX > this.level.xBorder || 
            this.destY < 0 || this.destY > this.level.yBorder || 
            !this.level.data[this.destX][this.destY]) {
            this.destX = this.xTile;
            this.destY = this.yTile;
        }

        if (this.destX === this.xTile && this.destY === this.yTile) {
            return false;
        } else {
            return true;
        }
    }

    openMenu() {
        this.state = this.STATES.MENU;
    }

    openChest() {
        this.state = this.STATES.OPENING;
    }

    finishChest() {
        this.state = this.STATES.IDLE;
    }

    update(delta) {
        switch (this.state)
        {
            case this.STATES.IDLE:
            {
                if (this.cd > 0) {
                    this.cd -= delta;

                    if (this.cd > 0) {
                        break;
                    }
                }

                var dir = this.getMovingDirection();
                
                if (dir) {
                    if (this.tryStartPathFinding(dir)) {
                        this.facing = dir;
                        this.play(dir, true);
                        this.state = this.STATES.PATHFINDING;
                    }
                }
                break;
            }
            case this.STATES.PATHFINDING:
            {
                console.log("Destination: " + this.destX + ", " + this.destY);
                var moveDir = this.facing;

                if (this.path.length) {
                    moveDir = this.path[0].dir;
                }

                var destX = this.path.length ? this.path[0].destX : this.destX;
                var destY = this.path.length ? this.path[0].destY : this.destY;

                var reachedDestination = false;

                if (moveDir === "northEast") {
                    this.y -= delta / 1000 * Constants.Player.SPEED;

                    if (this.y <= destY * Constants.Game.TILE_SIZE) {
                        this.y = destY * Constants.Game.TILE_SIZE;
                        this.yTile = destY;
                        reachedDestination = true;
                    }
                } else if (moveDir === "northWest") {
                    this.x -= delta  / 1000 * Constants.Player.SPEED;

                    if (this.x <= destX * Constants.Game.TILE_SIZE) {
                        this.x = this.destX * Constants.Game.TILE_SIZE;
                        this.xTile = destX;
                        reachedDestination = true;
                    }
                } else if (moveDir === "southEast") {
                    this.x += delta / 1000 * Constants.Player.SPEED;

                    if (this.x >= this.destX * Constants.Game.TILE_SIZE) {
                        this.x = this.destX * Constants.Game.TILE_SIZE;
                        this.xTile = this.destX;
                        reachedDestination = true;
                    }
                } else if (moveDir === "southWest") {
                    this.y += delta / 1000 * Constants.Player.SPEED;

                    if (this.y >= this.destY * Constants.Game.TILE_SIZE) {
                        this.y = this.destY * Constants.Game.TILE_SIZE;
                        this.yTile = this.destY;
                        reachedDestination = true;
                    }
                }

                if (reachedDestination) {
                    if (this.path.length) {
                        this.path.splice(0, 1);
                    }

                    if (!this.path.length) {
                        this.reachDestination();
                    }
                }

                break;
            }
            case this.STATES.OPENING:
            {
                // maybe play some animation?
                break;
            }
        }
    }

    reachDestination() {
        this.anims.pause();
        this.state = this.STATES.IDLE;
    }

    runIntoObstacle() {
        this.reachDestination();
        this.cd = 250;
    }
}
