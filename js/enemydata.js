let EnemyData = {
    Slime: {
        spriteKey: 'slime',
        initial_frame: '0.png',
        originX: 0.5,
        originY: 0.7,
        scaleX: 60.0 / 23.0,
        scaleY: 60.0 / 42.0,
        stats: {
            level: 1,
            health: 20,
            attack: 4,
            defense: 1,
            movement: 1,
            loot: {
                'silver_piece' : 0.2,
                'goopy_dagger' : 0.1
            }
        },
        animations: {
            default: {
                start: 0,
                end: 3,
                suffix: '.png',
                orientation: 'y',
                frameRate: 4,
                loops: -1
            }
        }
    }
};

export default EnemyData;