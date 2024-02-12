export default class Prototype
{
    OCCUPANTS = {
        NONE:   0,
        EMPTY:  1,
        PLAYER: 2,
        ENEMY:  3,
        CHEST:  4,
        FLAG:   5,
        TRAP:   6,
        TERRAIN:7,
        EXIT:   8
    };

    constructor () {
        this.players        = [];
        this.enemies        = [];
        this.flags          = [];
        this.chests         = [];
        this.turnTimer      = 0;
        this.deck           = [];
        this.missionType    = 0;
        this.turnorder      = [];
        this.listeners      = {};
        this.tiles = [
        [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
        [1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],
        [1,1,1,2,1,1,1,1,0,1,1,1,1,1,1],
        [1,1,1,1,3,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,3,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,3,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,2,1,1,1,1,0,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1]];
    }

    start() {
        this.turnTimer = 30;
    }

    nextTurn() {

    }

    _occupiable(x, y) {0
        return x >= 0 && y >= 0 && x < this.tiles.length && y < this.tiles[0].length && this.tiles[x][y];
    }

    _isTileCollidable(x, y) {
        if (this._occupiable(x, y)) {
            var tile = this.tiles[x][y];
            return tile == this.OCCUPANTS.EMPTY || tile == this.OCCUPANTS.FLAG || 
                   tile == this.OCCUPANTS.TRAP || tile == this.OCCUPANTS.EXIT;
        }
        return false;
    }

    updateChests() {

    }

    updatePlayers() {

    }

    updateEnemies() {

    }

    updateMission() {

    }

    updateTurnTimer() {
        this.turnTimer -= delta;
        if (this.turnTimer <= 0) {
            this.nextTurn();
        }
    }

    update(delta) {
        
    }
}