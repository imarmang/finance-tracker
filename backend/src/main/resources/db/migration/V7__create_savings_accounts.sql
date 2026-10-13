CREATE TABLE savings_accounts (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(60)   NOT NULL,
    opening_balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (opening_balance >= 0),
    goal_amount     NUMERIC(12,2) CHECK (goal_amount IS NULL OR goal_amount >= 0)
);

-- Names are unique regardless of case, matching payment methods.
CREATE UNIQUE INDEX uq_savings_accounts_name ON savings_accounts (lower(name));
