import pg from 'pg';
const { Pool } = pg;

// setup postgres connection pool
export function createPool() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/war_game';
    const pool = new Pool({
        connectionString,
    });

    return pool;
}