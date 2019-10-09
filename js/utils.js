let Utils = {
    CartesianToIsometric : function (cartPt) {
        var tempPt = new Phaser.Geom.Point();
        tempPt.x = cartPt.x - cartPt.y;
        tempPt.y = (cartPt.x + cartPt.y) / 2;
        return (tempPt);
    },
    IsometricToCartesian : function (x, y) {
        var tempPt = new Phaser.Geom.Point();
        tempPt.x = (2 * y + x) / 2;
        tempPt.y = (2 * y - x) / 2;
        return (tempPt);
    },
    create2DArray : function (x_len, y_len) {
        let array = new Array(x_len); 
     
        for(let i = 0; i < x_len; i++) {
            array[i] = new Array(y_len); 
        }
     
        return array;
    },
    fadeOutDestroy : function (scene, gameObject, duration)
    {
        scene.tweens.add({
            targets: gameObject,
            alpha: {to: 0.0},
            duration: duration,
            onComplete: function () {
                gameObject.destroy();
            }
        });
    },
    createLabel : function (scene, text)
    {
        return scene.rexUI.add.label({
            // width: 40,
            // height: 40,

            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),

            text: scene.add.text(0, 0, text, {
                fontSize: '24px'
            }),

            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        });
    }
};
export default Utils;