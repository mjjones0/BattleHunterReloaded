import Constants from '../constants.js';

export default class TileCursor extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y) {
        super(scene, x, y, 'tile');
        
        this.setDepth(Constants.Depths.TILES);

        particles = this.add.particles('blue');

        particles.createEmitter({
            alpha: { start: 1, end: 0 },
            scale: { start: 0.2, end: 0.5 },
            //tint: { start: 0xff945e, end: 0xff945e },
            speed: 20,
            accelerationY: -50,
            angle: { min: -90, max: 90 },
            rotate: { min: -180, max: 180 },
            lifespan: { min: 400, max: 600 },
            blendMode: 'ADD',
            frequency: 110,
            x: x,
            y: y
        });

        particles.setDepth(Constants.Depths.TILES);
    }
}