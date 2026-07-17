export type suit = 'H' | 'D' | 'C' | 'S';

export interface Card {
  suit: suit;
  rank: number;
}

export const Suits: suit[] = ['H', 'D', 'C', 'S'];

// Helper function to compare two cards based on their rank
export function compareCards(cardA: Card, cardB: Card): number {
  if (cardA.rank > cardB.rank) {
    return 1;
  } else if (cardA.rank < cardB.rank) {
    return -1;
  } else {
    return 0;
  }
}

export const MAX_RANK = 13; // King is highest
export const MIN_RANK = 1; // ace is lowest