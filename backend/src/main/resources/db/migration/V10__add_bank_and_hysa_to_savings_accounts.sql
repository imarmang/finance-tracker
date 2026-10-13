ALTER TABLE savings_accounts
    ADD COLUMN bank    VARCHAR(60) NOT NULL DEFAULT '',
    ADD COLUMN is_hysa BOOLEAN     NOT NULL DEFAULT false;
