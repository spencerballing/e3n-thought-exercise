-- Idempotent for easy re-setup during development.
DROP TABLE IF EXISTS round  CASCADE;
DROP TABLE IF EXISTS player CASCADE;
DROP TABLE IF EXISTS game   CASCADE;

CREATE TABLE game (
    id              BIGSERIAL   PRIMARY KEY,
    total_rounds    INT         NOT NULL, -- total number of rounds played in the game
    status          VARCHAR(20) NOT NULL, -- status of the game (e.g., "completed", "in_progress")
    fk_winner_player_id BIGINT, -- foreign key to the player who won the game (nullable if draw); constraint added below
    started_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP, -- timestamp when the game started
    ended_at        TIMESTAMP, -- timestamp when the game ended (nullable if in progress)
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP, -- timestamp when the game record was created
    modified_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP -- timestamp when the game record was last modified
);

CREATE TABLE player (
    id              BIGSERIAL   PRIMARY KEY,
    player_number   INT         NOT NULL, -- player number (1 or 2)
    name            VARCHAR(100) NOT NULL, -- player's name
    fk_game_id      BIGINT      NOT NULL REFERENCES game(id), -- foreign key to the game this player belongs to
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP, -- timestamp when the player record was created
    modified_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP -- timestamp when the player record was last modified
);

CREATE TABLE round (
    id              BIGSERIAL   PRIMARY KEY,
    fk_game_id      BIGINT      NOT NULL REFERENCES game(id), -- foreign key to the game this round belongs to
    round_number    INT         NOT NULL, -- the round number within the game
    p1_card_rank    INT         NOT NULL, -- rank of player 1's card
    p1_card_suit    VARCHAR(10) NOT NULL, -- suit of player 1's card
    p2_card_rank    INT         NOT NULL, -- rank of player 2's card
    p2_card_suit    VARCHAR(10) NOT NULL, -- suit of player 2's card
    war             BOOLEAN     NOT NULL, -- whether this round resulted in a war
    war_depth       INT         NOT NULL, -- depth of the war (0 if no war, 1 for first war, etc.)
    cards_won       INT         NOT NULL, -- number of cards won in this round
    fk_winner_player_id BIGINT  REFERENCES player(id), -- foreign key to the player who won this round (nullable if tie)
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP, -- timestamp when the round record was created
    modified_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP -- timestamp when the round record was last modified
);

-- game.fk_winner_player_id references player, which is created after game, so add the constraint here.
ALTER TABLE game
    ADD CONSTRAINT fk_game_winner_player
    FOREIGN KEY (fk_winner_player_id) REFERENCES player(id);

CREATE INDEX idx_round_game_id  ON round  (fk_game_id);
CREATE INDEX idx_game_winner    ON game   (fk_winner_player_id);
CREATE INDEX idx_player_game_id ON player (fk_game_id);
