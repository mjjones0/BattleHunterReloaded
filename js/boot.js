import Sounds from "./sounds.js";

export default class Boot extends Phaser.Scene
{
    constructor ()
    {
        super('Boot');
    }

    create ()
    {
		// put anything in registry that's useful?
        //this.registry.set('highscore', 0);
        Sounds.init();
				
        this.scene.start('Preloader');
    }
}
