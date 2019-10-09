import Constants from '../constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite
{
    STATES = {
        IDLE: 0,
        PATHFINDING: 1
    };

    constructor (scene, x, y, level, cursorKeys) {
        super(scene, x, y, 'hero', '1.png');
				
        this.setOrigin(0.5, 0.85);
        this.setDepth(Constants.Depths.ACTOR)

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.assignTile(x, y);

        this.destX = this.tileX;
        this.destY = this.tileY;
        this.moving = false;
        this.pathfinding = false;
        this.facing = 'southEast';
        this.state = this.STATES.IDLE;
        this.cursorKeys = cursorKeys;

        this.setLevel(level);

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
        if (!(x && y)) {
            this.xTile = Math.floor(Math.random() * Constants.Game.X_LEN);
            this.yTile = Math.floor(Math.random() * Constants.Game.Y_LEN);
            this.x = this.xTile * Constants.Game.TILE_SIZE;
            this.y = this.yTile * Constants.Game.TILE_SIZE;
        } else {
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

    getFacingDirection() {
        if (this.cursorKeys.right.isDown) {
            console.log("move right");
            return 'southEast';
        }
        if (this.cursorKeys.down.isDown) {
            console.log("move down");
            return 'southWest';
        }
        if (this.cursorKeys.up.isDown) {
            console.log("move up");
            return 'northEast';
        }
        if (this.cursorKeys.left.isDown) {
            console.log("move left");
            return 'northWest';
        }

        return null;
    }

    tryStartPathFinding(facing) {
        var xBorder = this.level.xBorder - 1;
        var yBorder = this.level.yBorder - 1;

        if (facing === "southEast" && this.xTile < xBorder) {
            this.destX = this.xTile + 1;
            this.destY = this.yTile;
        } else if (facing === "northEast" && this.yTile > 0) {
            this.destX = this.xTile;
            this.destY = this.yTile - 1;
        } else if (facing === "northWest" && this.xTile > 0) {
            this.destX = this.xTile - 1;
            this.destY = this.yTile;
        } else if (facing === "southWest" && this.yTile < yBorder) {
            this.destX = this.xTile;
            this.destY = this.yTile + 1;
        }

        if (this.destX === this.xTile && this.destY === this.yTile) {
            return false;
        } else {
            return true;
        }
    }

    update(delta) {
        switch (this.state)
        {
            case this.STATES.IDLE:
            {
                var dir = this.getFacingDirection();
                
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
                var reachedDestination = false;

                if (moveDir === "northEast") {
                    this.y -= delta / 1000 * Constants.Player.SPEED;

                    if (this.y <= this.destY * Constants.Game.TILE_SIZE) {
                        this.y = this.destY * Constants.Game.TILE_SIZE;
                        this.yTile = this.destY;
                        reachedDestination = true;
                    }
                } else if (moveDir === "northWest") {
                    this.x -= delta  / 1000 * Constants.Player.SPEED;

                    if (this.x <= this.destX * Constants.Game.TILE_SIZE) {
                        this.x = this.destX * Constants.Game.TILE_SIZE;
                        this.xTile = this.destX;
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
                    this.anims.pause();
                    this.state = this.STATES.IDLE;
                }

                break;
            }
        }
    }
}
