
import { readFileSync } from "fs";
import path from "path";
import { createPool } from "./pg";
import { logger } from "../utils/logger";

const schemaPath = path.join(__dirname, "../../db/schema.sql");

/**
 * This script sets up the database schema for the War game application. It reads the SQL schema from a file and executes it against the PostgreSQL database using a connection pool.
 */
async function setup() {
    const schema = readFileSync(schemaPath, "utf-8");
    const pool = createPool();
    try {
        await pool.query(schema);
        logger.info("Database schema created successfully.");
    } catch (err) {
        logger.error("Error creating database schema:", err);
        throw err;
    } finally {
        await pool.end();
    }
}

setup().catch((err) => {
    logger.error("Error during setup:", err);
    process.exit(1);
});