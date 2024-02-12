const card_types = {
    "0" : "attack",
    "1" : "defense", 
    "2" : "movement",
    "3" : "trap",
    // "4" : "luck"
};

const trap_types = {
    "0" : "leg-damage",
    "1" : "empty",
    "2" : "damage",
    "3" : "stun",
    "4" : "confuse"
};

const card_values = {
    "attack" :  [2,3,4,5,9,'S'],
    "defense" : [2,3,4,5,9,'D'],
    "movement": [1,2,3,4,'E'],
    "trap":     [0,1,2,3,4]
};

const card_value_weights = {
    "attack" :   [36, 26, 18, 12, 5, 3],
    "defense" :  [36, 26, 18, 12, 5, 3],
    "movement" : [40, 30, 15, 10, 5],
    "trap" :     [20, 20, 40, 10, 10]
};

const standard_deck = {
    "counts": [30, 30, 20, 20]
};

export default class Deck 
{
    constructor() {
        this.deck = [];
    }

    generate(deckConfig) {
        if (deckConfig === undefined) {
            this.generate(standard_deck);
        } else {
            if (deckConfig.hasOwnProperty("counts")) {
                for (let i = 0; i < deckConfig["counts"].length; ++i) {
                    let cardType = card_types[i.toString()];
                    let count = deckConfig["counts"][i];

                    for (let j = 0; j < count; ++j) {
                        let roll = Math.floor(Math.random() * 100) + 1;
                        let result = 0;
                        let weights =  card_value_weights[cardType];

                        for (let k = weights.length - 1; k >= 0; --k) {
                            // rng selects this card value based on the roll and weight
                            if (roll <= weights[k]) {
                                result = k;
                                break;
                            }
                        }   
                        
                        // add selected card to the deck
                        this.deck.push({"type": cardType, "value": card_values[cardType][k]});
                    }
                }
            } else {
                console.log("invalid deck config");
            }
        }
    }

    drawCard() {
        if (this.deck.length > 0) {
            return this.deck.pop();
        }
    }
}

