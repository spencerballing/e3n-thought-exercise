import { Card } from "./card";
import { shuffle } from "../utils/shuffle";

/*
* This class represents a player in the game.
* it encapsulates the player's hand of cards and provides methods to draw cards, add won cards to the hand, and check the number of cards left in the hand.
*/
export class Player {
    private hand: Card[]; // private because we don't want to allow direct access to the hand from outside the class

    constructor(
        readonly playerNumber: 1 | 2, //readonly because we don't want to change the player index after creation
        readonly name: string, // readonly because we don't want to change the player name after creation
        cards: Card[]
    ) {
        this.hand = cards;
    }

    drawCard(): Card | null {
        if (this.hand.length === 0) {
            return null; // no cards left to draw
        }
        return this.hand.shift() || null; // remove and return the top card from the hand
    }

    // Add cards to the bottom of the hand (after winning a round) in shuffled order to prevent 
    // repeated patterns that could lead to infinite loops in the game.
    addCardsToHand(cards: Card[]): void {
        this.hand.push(...shuffle(cards)); // add the won cards to the bottom of the hand
    }

    handCount(): number {
        return this.hand.length; // return the number of cards left in the hand
    }
}