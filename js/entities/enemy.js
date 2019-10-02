export default class Enemy extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y, key, frame) {
				super(scene, x, y, key, frame);
				
				scene.add.existing(this);
        scene.physics.add.existing(this);

        this.isAlive = true;
		}
		
		preUpdate (time, delta)
    {
        super.preUpdate(time, delta);

        if (!this.isAlive)
        {
            return;
        }
    }
}