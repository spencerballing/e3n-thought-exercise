# E3n Full Stack Engineer Thought Exercise — Game of War Simulator

A CLI simulation of the classic "Game of War" card game. This is my implementation for the thought exercise assigned as part of the interview process for the "Full Stack Software Engineer" position at `E3n`.

## Requirements

- `Node.js` 18+ and npm
- `Docker` (used to run PostgreSQL locally via Docker Compose)

## How to Run

1. **Clone the repository**

   ```bash
   git clone git@github.com:spencerballing/e3n-thought-exercise.git
   cd e3n-thought-exercise
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the database and create the schema**

   ```bash
   npm run db:init
   ```

   This starts a PostgreSQL container and creates the `game`, `player`, and
   `round` tables. (It runs `db:up` followed by `db:setup` — see the scripts
   below if you'd rather run them separately.)

4. **Run a game**

   ```bash
   npm run start
   ```

   This plays one full game and saves the result to the database. You should see
   `Game result saved successfully.` when it completes.

## Configuration

Configuration is provided through environment variables. A template is included
at [`.env.example`](.env.example) — copy it to `.env` and edit as needed:

```bash
cp .env.example .env
```

All variables are optional; the app falls back to sensible defaults if they're
unset.

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/war_game` | PostgreSQL connection string. The default matches [`docker-compose.yml`](docker-compose.yml). |
| `NUMBER_OF_GAMES` | `10` | Number of games to simulate and persist per run. |
| `MAX_ROUNDS` | `1000` | Round cap before a game is cut off and marked `max`. |
| `LOG_LEVEL` | `info` | Logging verbosity: `error`/`info`/`debug`

## Database

PostgreSQL runs in a Docker container defined in [`docker-compose.yml`](docker-compose.yml).
The application connects using the `DATABASE_URL` from your environment, falling
back to the local default above.

### npm scripts

| Script | Description |
| --- | --- |
| `npm run start` | Play one game and persist the result. |
| `npm run build` | Compile TypeScript to JavaScript. |
| `npm run db:up` | Start the PostgreSQL container (waits until it's healthy). |
| `npm run db:down` | Stop and remove the container (data is preserved in a volume). |
| `npm run db:clean` | Stop the container **and delete its data volume** (full wipe). |
| `npm run db:setup` | Create/rebuild the schema. Drops and recreates all tables. |
| `npm run db:reset` | Clear all data by rebuilding the schema (alias for `db:setup`). |
| `npm run db:init` | Start the database and create the schema (`db:up` + `db:setup`). |

### Schema

Three tables (defined in [`db/schema.sql`](db/schema.sql)):

- **`game`** — one row per game: total rounds, final status, and the winning player.
- **`player`** — the two players belonging to a game.
- **`round`** — one row per round: each player's card, whether a war occurred, its
  depth, cards won, and the round's winner.

A game's `status` is one of `started`, `completed`, `draw`, or `max` (the
1000-round cap was reached with the game unresolved).

## Project Structure

```
src/
  index.ts          Entry point: plays a game and saves the result.
  models/           Domain logic — card, deck, player, round, and game rules.
  data/
    pg.ts           PostgreSQL connection pool.
    setup.ts        Applies db/schema.sql.
    persistence.ts  Persists a GameResult (game, players, rounds) in a transaction.
db/
  schema.sql        Table definitions.
```

## Additional Documentation

- **[`docs/Full_Stack_Software_Engineer_Thought_Exercise_Feb_2026.pdf`](docs/Full_Stack_Software_Engineer_Thought_Exercise_Feb_2026.pdf)** — Original thought exercise definition.
- **[`docs/Design.md`](docs/Design.md)** — Design decisions, game rules, assumptions, and thought process.
- **[`docs/Time.md`](docs/Time.md)** — Rough estimate of time spent on the exercise.
