import Constants from '../constants.js';
import Utils from '../utils.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y, data) {
        super(scene, x, y, data.spriteKey, data.initial_frame);

        this.config = data;
        
        this.setOrigin(data.originX, data.originY);
        this.setScale(data.scaleX, data.scaleY);
        this.setDepth(Constants.Depths.ACTOR);
				
		scene.add.existing(this);
        scene.physics.add.existing(this);

        this.alive = true;
        this.key = data.spriteKey;
        this.createAnimations(scene);

        this.scene = scene;
        this.assignTile(x, y);

        this.stats = data.stats;
    }
    
    createAnimations(scene) {
        var defAnim = this.config.animations.default;

        scene.anims.create({
            key: 'default', 
            frames: scene.anims.generateFrameNames(this.key, 
            {
                start: defAnim.start, 
                end: defAnim.end, 
                suffix: defAnim.suffix
            }), 
            frameRate: defAnim.frameRate, 
            repeat: defAnim.loops
        });

        this.play('default', (defAnim.loops == -1));
    }

    assignTile(x, y) {
        this.xTile = x;
        this.yTile = y;
        this.x = this.xTile * Constants.Game.TILE_SIZE;
        this.y = this.yTile * Constants.Game.TILE_SIZE;
    }

    getLoot() {
        var loot = this.stats.loot;
        var results = [];

        Object.keys(loot).forEach(function (key) {
            var roll = loot[key] * 100;
            if (Utils.getRandomInt(1, roll) == 1) {
                results.push(key);
            }
        });

        return results;
    }
		
	preUpdate (time, delta)
    {
        super.preUpdate(time, delta);

        if (!this.alive)
        {
            return;
        }
    }
}