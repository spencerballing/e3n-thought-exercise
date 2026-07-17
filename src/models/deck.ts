import { Card, Suits, MAX_RANK, MIN_RANK } from "./card";
import { shuffle } from "../utils/shuffle";
import { logger } from "../utils/logger";

// Create a standard deck of 52 cards (ordered)
export function createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of Suits) {
        for (let rank = MIN_RANK; rank <= MAX_RANK; rank++) {
            deck.push({ suit, rank });
        }
    }
    return deck;
}

// create a new deck, shuffle it, then return two halves of the deck
export function deal(): [Card[], Card[]] {
    const deck = createDeck();
    const shuffledDeck = shuffle(deck);
    const midIndex = deck.length / 2;
    const player1Deck = shuffledDeck.slice(0, midIndex);
    const player2Deck = shuffledDeck.slice(midIndex);
    return [player1Deck, player2Deck];
}

// Helper function to print the deck of cards
export function printDeck(deck: Card[]): void {
    for (const card of deck) {
        logger.debug(`Card ${deck.indexOf(card) + 1}: ${card.rank} of ${card.suit}`);
    }
}