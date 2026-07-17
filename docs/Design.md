# Design Document
## Stack Decision

I chose the following a because it aligns with the Job description stack and what I'm most comfortable with.
- NodeJS
- TypeScript
- Postgres

## Scope
** The "Response Requirements" list these as deliverables for the project

1.  Your SQL schema (DDL) and any brief notes/assumptions. 
2.  Working code for your simulator. 
3.  Brief documentation explaining your design decisions, how to run the code, and how 
results are persisted (including how each round/game winner is stored).


## Design decisions

### Game Rules
#### 1. Game termination
**Issue:** It's possible for a game of War to go on forever. With certain card
orderings the same sequence of battles repeats indefinitely and neither player
ever wins.

**Decision:** Two independent safeguards guarantee every game terminates:
1. **Won cards are shuffled before returning to the hand** (`Player.addCardsToHand`).
   Returning won cards in a fixed order is the main cause of infinite cycles,
   shuffling them breaks the repeating patterns.
2. **A hard round cap, `MAX_ROUNDS` (default 1000).** If a game ever reaches the
   cap it is stopped and marked `max`. This guarantees games terminate regardless
   of order.

#### 2. Game outcomes
**Issue:** A game can end in more than one way, and an unresolved game (hit the
cap) is not the same as a genuine tie. A tie would be extremely rare - requiring
a "war" situation on every round starting from 26 cards each.

**Decision:** A game ends in one of these statuses, kept deliberately distinct:

| Status | Meaning |
| --- | --- |
| `completed` | One player captured all cards — a normal win. |
| `draw` | Both players ran out of cards on the same battle — a true tie. |
| `max` | The round cap was reached while the game was still unresolved. |



### Models/Classes

- **`Card`** - An Immutable object representing a standard playing card with a `rank` (1-13) representing A-K and a `suit` (H/D/C/S). Rank is what determines who wins a battle or war -- suits have no affect on the comparison.
- **`Deck`** - Contains functions for creating/shuffling/dealing a standard 52-card deck
- **`Game`** - A class representing a full game. Contains the players and orchestrates the game loop and logic. Exports a main `play()` function that starts a game.
- **`Player`** - A class representing an individual Player containing a `playerNumber`, a `name` and their `hand` - or a queue modeling the Cards they were either dealt, or obtained during gameplay. Responsibilities: `drawCard()`, `addCardsToHand()`, `handCount()`
- **`Round`** - A result object recording each round or "battle" within the game.
  Captures each player's deciding card, whether it was a war, the `warDepth`,
  `cardsWon`, and the round winner.
- **`GameResult`** - The full outcome of a game: total rounds, the ordered list of
  `Round`s, the winner, and the final status. This is the single object `Game.play()`
  returns and the only thing the persistence layer consumes.

**Key decisions:**
- **Rounds are the bottleneck** - Games usually run hundreds of rounds (up to the MAX_ROUNDS cap). When thinking about
scale, I decided 


### Persistence — how results are stored

`Persistence.saveGameResult(gameResult)` writes a finished game to the database.
This directly addresses deliverable #3 (how results are persisted, including how
each round/game winner is stored).

**Decision — persist after completion, in one transaction.** The game is
simulated fully in memory and written once, wrapped in `BEGIN … COMMIT` (rolling
back on any error). Writing after completion keeps the game atomic (no partial
games) and keeps database concerns out of the game loop. Per-round timestamps
were intentionally *not* used to order rounds — the simulation finishes in
milliseconds so they'd be identical; `round_number` provides ordering instead.

**Insert order** is dictated by the foreign keys:
1. Insert the `game` (winner left null) → get its id.
2. Insert both `player`s → build a `Map<playerNumber, playerId>`.
3. Insert every `round`, translating each round's winner from player number to
   player id via that map.
4. Update the `game` with the winner's id and `ended_at`.

**How winners are stored:** both `game.fk_winner_player_id` and
`round.fk_winner_player_id` store the **persisted player id** (not the 1/2 number,
and not a name). The number → id translation happens through the map built in
step 2. A `null` winner means a draw/tie.

**Trade-off — round inserts are a loop of single-row inserts**, not one batched
statement. All inserts share one transaction and connection, so the cost is
acceptable for a local simulator, and the single-row form is easier to verify. A
batched `INSERT`/`UNNEST` would be the first optimization if throughput mattered.

### Database Schema (DDL)

The full DDL is in [`db/schema.sql`](../db/schema.sql). Three tables model the
domain directly. The schema is **idempotent** — it drops and recreates the tables
— so `db:setup` doubles as a reset.

**Tables**
- **`game`** — one row per game: `total_rounds`, `status`, the winning player
  (`fk_winner_player_id`, nullable), and `started_at` / `ended_at`.
- **`player`** — the two players of a game, linked by `fk_game_id`.
- **`round`** — one row per round, linked by `fk_game_id`, with each player's card
  stored as **separate rank and suit columns**, plus `war`, `war_depth`,
  `cards_won`, and `fk_winner_player_id`.

