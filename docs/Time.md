# Time
The table below gives rough estimates on time spent in different aspects of the thought exercise.

| Category | Estimate | Notes |
| --- | --- | --- |
| Design & planning | ~1 hr | Reading the prompt, interpreting the War rules, deciding the stack, and sketching the model/schema before writing code. |
| Scaffolding & structure | ~0.75 hr | Project setup — TypeScript config, `tsx`, npm scripts, and the `models` / `data` / `utils` layering. |
| Core game logic | ~1.5 hr | The play loop, war handling and nesting, termination safeguards, and the outcome statuses. |
| Schema design (DDL) and DB Setup| ~0.75 hr | Designing the `game` / `player` / `round` tables, foreign keys,  Docker Compose for Postgres |
| Persistence layer | ~1.25 hr | The transactional save, player-number → id mapping, and round inserts. |
| Config & logging | ~0.5 hr | Environment-driven config (`.env`) and the leveled logger. |
| Documentation | ~1.5 hr | README, this design doc, and inline comments. |
| Debugging & verification | ~0.75 hr | Connection issues, schema syntax, testing and manual verification in the database. |
| **Total** | **~8 hrs** | |


## With more time

Given more time, the following would be the highest-value additions, roughly in
priority order:

1. **Automated tests.** Add unit and integration tests throughout the codebase.

2. **Batched round inserts.** Replace the per-round insert loop with a single
   multi-row `INSERT`. I deferred deliberately for readability, but it's the first
   thing to optimize to scale.

3. **Use an ORM.** Raw postgres queries, schema migrations, typing, etc, could 
    made easier using an ORM.
4. **Full stack application.** Add a dashboard frontend interface that could be used
    to play the game, run simulations, and monitor game results. Build a 
    REST API that the UI can utilize for all the game logic and data persistence.
5. **Add more players.** Extend the game to allow for more than 2 players.
6. **Analytics** Show some analytics or provide some queries to give results
of running many games at scale