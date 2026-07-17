import { Card } from "./card";

/*
* This interface represents the result of a single round in the game.
*/

export interface Round {
  roundNumber: number;
  p1Card: Card;
  p2Card: Card;
  war: boolean;
  warDepth: number;
  cardsWon: number;
  winner: number | null; // 1 for player 1, 2 for player 2, null for tie
}