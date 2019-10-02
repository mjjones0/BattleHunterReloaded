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
    create2DArray : function (numRows, numColumns) {
        let array = new Array(numRows); 
     
        for(let i = 0; i < numRows; i++) {
            array[i] = new Array(numColumns); 
        }
     
        return array;
    }
};
export default Utils;