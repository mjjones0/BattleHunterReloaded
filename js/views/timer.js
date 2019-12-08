import Constants from '../constants.js';

export default class Timer
{
    constructor(scene, x, y, maxTime) {
        this.scene = scene;
        this.turnTimer = maxTime;
        this.maxTime = maxTime;
        this.x = x;
        this.y = y;
        this.ticking = false;
    }

    start() {
        this.ticking = true;
    }

    stop() {
        this.ticking = false;
    }

    reset(time) {
        this.turnTimer = time;
        this.update(0);
    }

    create() {
        this.view = this.scene.add.text(this.x, this.y, Math.floor(this.turnTimer).toString(), 
                            { fontFamily: "Arial", fontSize: 50, color: "#ffffff" });
        this.view.setStroke('#444444', 4);
        this.view.setShadow(2, 2, "#333333", 2, true, true);
        this.view.setScrollFactor(0, 0).setDepth(Constants.Depths.UX).setOrigin(0.5, 0.5);
    }

    update(delta) {
        if (!this.ticking) {
            return;
        }

        this.turnTimer -= (delta / 1000);
        if (this.turnTimer <= 0) {
            this.turnTimer = this.maxTime;
        }

        if (this.turnTimer < 10) {
            this.view.setTint(0xff0000);
        } else if (this.turnTimer < 20) {
            this.view.setTint(0xff7700);
        } else if (this.turnTimer < 30) {
            this.view.setTint(0xffff00);
        } else {
            this.view.clearTint();
        }

        this.view.setText(Math.floor(this.turnTimer).toString());
    }
}