export default class Sliders
{
    constructor(scene, x, y) {
        this.scene = scene;
    }

    create() {
        const COLOR_LIGHT = 0x7b5e57;
        const COLOR_DARK = 0x260e04;
        var scene = this.scene;
        var print0 = this.scene.add.text(0, 0, '').setDepth(Constants.Depths.UX).setScrollFactor(0, 0);
        var slider = this.scene.rexUI.add.slider({
                x: 200,
                y: 300,
                width: 20,
                height: 200,
                orientation: 'x',

                track: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 8, COLOR_DARK),
                thumb: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_LIGHT),

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
}