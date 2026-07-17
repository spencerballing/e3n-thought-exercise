import { GameResult } from "../models/game";
import { Round } from "../models/round";
import { Pool, PoolClient } from "pg";

/*
* The Persistence class is responsible for saving game results to the database.
* It uses a PostgreSQL connection pool to manage database connections and transactions.
*/
export class Persistence {
    private pool: Pool;
  
    constructor(pool: Pool) {
        this.pool = pool;
    }


    // Save the game result to the database, including the game, players, rounds, and winner.
    async saveGameResult(gameResult: GameResult): Promise<void> {
        const { totalRounds, rounds, winner, status } = gameResult;

        // Start a transaction
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Insert the game result
            const gameId: number = await this.insertGame(client, totalRounds, status);

            // Insert Two players
            const playerIdByNumber: Map<number, number> = await this.insertPlayers(client, gameId);

            // Insert rounds
            await this.insertRounds(client, gameId, rounds, playerIdByNumber);
            
            // Set the game winner
            await this.updateGameWinner(client, gameId, winner, playerIdByNumber);

            // Commit the transaction
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Insert a new game record into the database and return the generated game ID.
    private async insertGame(client: PoolClient, totalRounds: number, status: string): Promise<number> {
        const gameInsertQuery = `
            INSERT INTO game (total_rounds, status, started_at, created_at, modified_at)
            VALUES ($1, $2, NOW(), NOW(), NOW())
            RETURNING id
        `;
        const gameInsertResult = await client.query(gameInsertQuery, [totalRounds, status]);
        return gameInsertResult.rows[0].id;
    }

    // Insert two players into the database and return a map of player numbers to their generated IDs.
    private async insertPlayers(client: PoolClient, gameId: number): Promise<Map<number, number>> {
        const map = new Map<number, number>();
        for (const player of [1, 2]) {
            const playerInsertQuery = `
                INSERT INTO player (player_number, name, fk_game_id, created_at, modified_at)
                VALUES ($1, $2, $3, NOW(), NOW())
                RETURNING id
            `;
            const playerInsertResult = await client.query(playerInsertQuery, [player, `Player ${player}`, gameId]);
            map.set(player, playerInsertResult.rows[0].id);
        }
        return map;
    }

    // Insert all rounds for a game into the database.
    private async insertRounds(client: PoolClient, gameId: number, rounds: Round[], playerIdByNumber: Map<number, number>): Promise<void> {
        if (rounds.length === 0) return;


        const insertRoundQuery = `
            INSERT INTO round (
                fk_game_id, round_number,
                p1_card_rank, p1_card_suit,
                p2_card_rank, p2_card_suit,
                war, war_depth, cards_won,
                fk_winner_player_id,
                created_at, modified_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        `;

        for (const round of rounds) {
            const winnerPlayerId =
                round.winner === null ? null : playerIdByNumber.get(round.winner);

            await client.query(insertRoundQuery, [
                gameId,
                round.roundNumber,
                round.p1Card.rank,
                round.p1Card.suit,
                round.p2Card.rank,
                round.p2Card.suit,
                round.war,
                round.warDepth,
                round.cardsWon,
                winnerPlayerId,
            ]);
        }
    }

    // Update the game record with the winner's player ID and set the ended_at timestamp.
    private async updateGameWinner(client: PoolClient, gameId: number, winner: number | null, playerIdByNumber: Map<number, number>): Promise<void> {
        const winnerPlayerId = winner === null ? null : playerIdByNumber.get(winner);
        const updateGameQuery = `
            UPDATE game
            SET fk_winner_player_id = $1, ended_at = NOW(), modified_at = NOW()
            WHERE id = $2
        `;
        await client.query(updateGameQuery, [winnerPlayerId, gameId]);
    }
}
