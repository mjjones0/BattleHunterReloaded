let Utils = {
    isometricToCartesian : function (x, y) {
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
    transpose: function(matrix) {
        if (!matrix) {
            return matrix;
        }
        array[0].map((col, i) => array.map(row => row[i]));
    },
    fadeOutDestroy : function (scene, gameObject, duration, callback)
    {
        scene.tweens.add({
            targets: gameObject,
            alpha: {to: 0.0},
            duration: duration,
            onComplete: function () {
                gameObject.destroy();
                if (callback) {
                    callback();
                }
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
    },
    /**
     * Returns a random number between min (inclusive) and max (exclusive)
     */
    getRandomArbitrary: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    /**
     * Returns a random integer between min (inclusive) and max (inclusive).
     * The value is no lower than min (or the next integer greater than min
     * if min isn't an integer) and no greater than max (or the next integer
     * lower than max if max isn't an integer).
     * Using Math.round() will give you a non-uniform distribution!
     */
    getRandomInt: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    shuffle: function(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
        
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
        
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        
        return array;
    },
    getIsoCoordinates(x, y) {
        var screenX = x - y;
        var screenY = (x + y) / 2;

        return {x: screenX, y: screenY};
    },
    // SCENE UTILS
    getScreenCoordinates(entity, camera, screenWidth, screenHeight) {
        //var camera = this.cameras.main;
        var screenX = entity.x - entity.y + screenWidth / 2 - camera.scrollX;
        var screenY = (entity.x + entity.y) / 2 + screenHeight / 2 - camera.scrollY;
        return {x: screenX, y: screenY};
    },
    getScrollForTile(x, y, tileSize) 
    {
        var cartX = x * tileSize;
        var cartY = y * tileSize;

        return this.getIsoCoordinates(cartX, cartY);
    }
};
export default Utils;