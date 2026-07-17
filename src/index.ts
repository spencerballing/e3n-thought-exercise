import { Game, GameResult } from "./models/game";
import { Persistence } from "./data/persistence";
import { createPool } from "./data/pg";
import { logger } from "./utils/logger";

const NUMBER_OF_GAMES = process.env.NUMBER_OF_GAMES ? parseInt(process.env.NUMBER_OF_GAMES, 10) : 10;

/*
* This is the main entry point of the application. It initializes the database connection pool, creates a Persistence instance, and runs a loop to play and save multiple games of War.
* Each game is played in memory, and the results are saved to the database using the Persistence class.
*/
async function main() {
    // Create postgres connection pool
    const pool = createPool();
    const persistence = new Persistence(pool);
    try {
        // Loop to play and save multiple games
        for (let i = 0; i < NUMBER_OF_GAMES; i++) {
            // Start a new game and get results in memory
            const result: GameResult = new Game().play();

            // Save the game result to the database
            await persistence.saveGameResult(result);
            logger.info(`Game ${i + 1} result saved successfully.`);
        }
    } catch (error) {
        logger.error("Error occurred in main game loop:", error);
    } finally {
        await pool.end();
    }
}

main().catch((err) => {
    logger.error("Error in main execution:", err);
    process.exit(1);
});