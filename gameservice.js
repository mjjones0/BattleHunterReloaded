const colors = require('colors');
const prompt = require('prompt-sync')();
const Deck = require('./content/cards.js');

const items = {
    "0" : {
        "name" : "boots",
        "modifier-stat": "movement",
        "modifier-value": 1,
        "gold-value": 5
    },

    "1" : {
        "name" : "silver coin",
        "modifier-stat": "none",
        "modifier-value": 0,
        "gold-value": 10
    },

    "2" : {
        "name" : "dagger",
        "modifier-stat": "attack",
        "modifier-value": 1,
        "gold-value": 5,
        "range": 1
    },

    "3" : {
        "name" : "bow",
        "modifier-stat": "attack",
        "modifier-value": 1,
        "gold-value": 10,
        "range": 2
    }
}; 

const enemies = {
    "0" : {
        "name" : "slime", 
        "health": 10,
        "attack": 2,
        "defense": 1,
        "movement": 1,
        "loot": [1],
        "loot-weights": [30],
        "level": 1,
        "experience": 30
    }, 
    "1" : {
        "name" : "goblin archer",
        "health" : 14,
        "attack" : 1,
        "defense" : 1,
        "movement" : 2,
        "loot" : [1, 3],
        "loot-weights" : [30, 10],
        "level" : 2,
        "experience" : 40 
    }
};

const chest_types = {
    "0" : {
        "items" : [0, 1, 2],
        "weights" : [0.2, 0.6, 0.2]
    }
};

const base_player = {
    "name" : "player", 
    "health": 10,
    "attack": 1,
    "defense": 1,
    "movement": 1,
    "items": [],
    "money": 0,
    "level": 0,
    "experience": 0,
    "stat-points": 15,
    "range": 1,
};

const entity = {
    "type" : "CHANGEME",
    "position" : [0, 0]
};

const stat_values = {
    "health" : 0.5,
    "attack" : 2,
    "defense" : 2,
    "moevment" : 4
};

/* fibonacci sequence lol */
const experience_thresholds = {
    "1" : 100,
    "2" : 200,
    "3" : 300,
    "4" : 500,
    "5" : 800,
    "6" : 1300,
    "7" : 2100,
    "8" : 3400,
    "9" : 5500,
    "10" : 8900,
    "11" : 14400, 
    "12" : 23300,
    "13" : 37700,
    "14" : 61000,
    "15" : 98700
}

const entity_types = {
    "0" : "tile",
    "1" : "empty", 
    "2" : "unit",
    "4" : "chest",
    "5" : "trap",
    "6" : "exit",
    "7" : "flag"
};

const mission_types = {
    "0" : "kill",
    "1" : "find", 
    "2" : "escort",
    "3" : "escape",
    "4" : "fix"
};

const level_obj = {
    "starting_position" : [0, 0],
    "columns" : 0,
    "rows" : 0,
    "enemy-types" : [],
    "chest-types" : [],
    "cells" : [],
    "entity-positions" : [],
    "random-enemy-spawns" : true,
    "random-chest-spawns" : true,
    "number-of-chests" : 0,
    "number-of-enemies" : 0,
    "turn-duration-seconds" : 0,
    "mission-type" : "0"
}

const demo_level = {
    "starting_position" : [2, 2],
    "columns" : 12,
    "rows" : 10,
    "enemy-types" : [0],
    "chest-types" : [0],
    "cells" : [
        [1,1,0,0,0,1,1,0,0,0,1,1],
        [1,0,0,0,0,1,1,0,0,0,0,1],
        [0,0,0,0,0,1,1,0,0,0,0,0],
        [0,0,0,0,0,1,1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,1,0,0,0,0,0],
        [0,0,0,0,0,1,1,0,0,0,0,0],
        [1,0,0,0,0,1,1,0,0,0,0,1],
        [1,1,0,0,0,1,1,0,0,0,1,1]
    ],
    "entity-positions" : [
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,2,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    "random-enemy-spawns" : true,
    "random-chest-spawns" : true,
    "number-of-chests" : 2,
    "number-of-enemies" : 2,
    "turn-duration-seconds" : 60,
    "mission-type" : "0",
    "mission-reward-money" : 100,
    "mission-reward-experience" : 100
};

const scenes = {
    "0" : "play",
    "1" : "merchant",
    "2" : "upgrade",
    "3" : "options"
};

function main_menu() {
    console.log("Please make a selection:\n");
    console.log("1.) Play Demo\n");
    //console.log("1.) Play Game\n");
    //console.log("2.) Create Character\n");
    //console.log("3.) Save Character\n");
    //console.log("4.) Load Character\n");
    //console.log("5.) Merchant\n");
    //console.log("6.) Upgrade Character\n");
    //console.log("7.) Options\n");
    console.log("2.) Exit Game\n");
}

function create_character() {
    console.log("Not yet implemented!");
    return;
}

function save_character() {
    console.log("Not yet implemented!");
    return;
}

function load_character() {
    console.log("Not yet implemented!");
    return;
}

function merchant() {
    console.log("Not yet implemented!");
    return;
}

function upgrade_character() {
    console.log("Not yet implemented!");
    return;
}

function options() {
    console.log("Not yet implemented!");
    return;
}

function show_level_state(level) {

}

function show_player_options(level, player) {

}

function show_action_result(action) {

}

function is_game_over(level, player) {

}

function merchant(player) {

}

function upgrade(player) {

}

function save(player) {

}

function show_intro() {
    console.log("Welcome to Battle Hunter Reloaded Server Demo!\n");
}

function show_level_summary(level) {

}

function play_demo() {
    console.log("Not yet implemented!");
    return;
}

function exit_game() {
    console.log("Thanks for playing!");
}

function get_input_response() {
    const choice = prompt('Please make a selection: ');
    return choice;
}

function run_game() {
    show_intro();

    while(true) {
        main_menu();
        
        switch (get_input_response()) {
            case "1":
                play_demo();
                break;
            case "2":
                exit_game();
                return;
            default:
                console.log("Invalid response.\n");
                break;
        }
    }
}

run_game();