CREATE TABLE savings_deposits (
    id           BIGSERIAL PRIMARY KEY,
    deposit_date DATE          NOT NULL,
    account_id   BIGINT        NOT NULL REFERENCES savings_accounts (id),
    amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    note         VARCHAR(200)
);

CREATE INDEX idx_savings_deposits_date ON savings_deposits (deposit_date);

-- Checked before a savings account is deleted, and used to compute each account's balance,
-- so it must not scan every deposit.
CREATE INDEX idx_savings_deposits_account ON savings_deposits (account_id);
