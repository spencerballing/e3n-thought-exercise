/*
* Shuffles an array of cards (can be the full initial deck or a subset of cards)
*/
export function shuffle<T>(deck: T[]): T[] {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}