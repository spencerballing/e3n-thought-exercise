import { Card, compareCards } from "./card";
import { Player } from "./player";
import { deal } from "./deck";
import { Round } from "./round";
import { logger } from "../utils/logger";

export const MAX_ROUNDS = process.env.MAX_ROUNDS ? parseInt(process.env.MAX_ROUNDS) : 1000;

export type GameStatus = "started" | "draw" | "max" | "completed";

/**
 * This interface represents the result of a game of War between two players.
 */
export interface GameResult {
    totalRounds: number;
    rounds: Round[];
    winner: number | null; // 1 for player 1, 2 for player 2, null for tie
    status: GameStatus;
}

/**
 * This class represents a game of War between two players. It manages the game state, including the players' hands, the rounds played, and the overall game result.
 * The game continues until one player has all the cards, or until a maximum number of rounds is reached, or edge case where both players run out of cards at the same time.
 * The game result is returned at the end of the game, including the total number of rounds played, the winner (if any), and the status of the game.
 */
export class Game {
    private readonly p1: Player;
    private readonly p2: Player;

    constructor() {
        const [p1Hand, p2Hand] = deal();
        
        this.p1 = new Player(1, "Player 1", p1Hand);
        this.p2 = new Player(2, "Player 2", p2Hand);
    }

    play(): GameResult {
        const rounds: Round[] = [];
        let roundCount = 0;
        let gameStatus: GameStatus = "started";
        let winner: number | null = null;
        logger.info("Starting the game of War!");

        while (roundCount < MAX_ROUNDS) {
            logger.debug(`Round ${roundCount + 1}: Player 1 has ${this.p1.handCount()} cards, Player 2 has ${this.p2.handCount()} cards.`);
            // Base case: if either player has no cards left, the game ends
            if (this.p1.handCount() === 0 && this.p2.handCount() === 0) {
                gameStatus = "draw";
                break;
            } else if (this.p1.handCount() === 0) {
                winner = 2;
                gameStatus = "completed";
                break;
            } else if (this.p2.handCount() === 0) {
                winner = 1;
                gameStatus = "completed";
                break;
            }
            const round = this.playRound(rounds.length + 1);
            if (round === null) {
                gameStatus = "draw";
                break;
            }
            rounds.push(round);
            roundCount++;
        }

        // If the maximum number of rounds is reached, declare a status of "max"
        if (roundCount >= MAX_ROUNDS && gameStatus === "started") {
            gameStatus = "max";
        }


        return {
            totalRounds: roundCount,
            rounds,
            winner,
            status: gameStatus,
        };

    }

    /**
     * This method plays a single round of the game. It draws one card from each player's hand and compares them.
     * If the cards are equal, it initiates a "war" where each player draws additional cards until a winner is determined.
     */
    private playRound(roundNumber: number): Round | null {
        const stack: Card[] = [];
        let war = false;
        let warDepth = 0;

        let p1Card = this.p1.drawCard();
        let p2Card = this.p2.drawCard();
        stack.push(p1Card!, p2Card!);

        while (true) {
            logger.debug(`Round ${roundNumber}${war ? ` (War depth: ${warDepth})` : ""}: Player 1 plays ${p1Card!.rank} of ${p1Card!.suit}, Player 2 plays ${p2Card!.rank} of ${p2Card!.suit}.`);
            const comparison = compareCards(p1Card!, p2Card!);
            if (comparison !== 0) {
                const winner = comparison > 0 ? 1 : 2;
                
                if (comparison > 0) {
                    this.p1.addCardsToHand(stack);
                } else if (comparison < 0) {
                    this.p2.addCardsToHand(stack);
                }

                logger.debug(`Round ${roundNumber}${war ? ` (War depth: ${warDepth})` : ""}: Player ${winner} wins the round and takes ${stack.length} cards.`);
                return {
                    roundNumber,
                    p1Card: p1Card!,
                    p2Card: p2Card!,
                    war,
                    warDepth,
                    cardsWon:
                    stack.length,
                    winner: winner
                };
            }
            
            // If the cards are equal, we have a war situation
            war = true;
            warDepth++;
            if (this.p1.handCount() === 0 && this.p2.handCount() === 0) return null; // both players are out of cards, it's a draw
            // "If one of the players has no more cards in a battle that player loses that battle"
            if (this.p1.handCount() === 0) {
                this.p1.addCardsToHand(stack) // player 1 is out of cards, player 2 wins
            }
            if (this.p2.handCount() === 0) {
                this.p2.addCardsToHand(stack) // player 2 is out of cards, player 1 wins
            }

            p1Card = this.chooseWarCard(this.p1, stack),
            p2Card = this.chooseWarCard(this.p2, stack)
        }
    }


    /**
     * This method handles the "war" situation where both players have drawn cards of equal rank.
     * Each player draws up to 3 additional cards (or as many as they have left) and adds them to the stack.
     * A random card from each player's war stack is then chosen for comparison.
     */
    private chooseWarCard(player: Player, stack: Card[]): Card {
        const warSize = Math.min(3, player.handCount()); // choose up to 3 cards
        const warStack: Card[] = [];
        for (let i = 0; i < warSize; i++) {
            warStack.push(player.drawCard()!); // add the war cards to the their own stack
        }
        stack.push(...warStack); // add the war cards to the main stack
        // return a random card from the war stack for comparison
        return warStack[Math.floor(Math.random() * warStack.length)];
    }

}

