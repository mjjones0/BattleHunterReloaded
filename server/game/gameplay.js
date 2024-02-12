const players = [];
const enemies = [];
const chests  = [];

const SCENE_STATES = {
    Lobby:    0,
    Upgrade:  1,
    Opening:  2,
    Gameplay: 3,
    Ending:   4,
    Summary:  5
};

const TURN_STATES = {
    Menu:   0,
    Move:   1,
    Select: 2,
    Attack: 3
};

const MENU_CHOICES = {
    Move:   0,
    Attack: 1,
    Rest:   2,
    Defend: 3
};

