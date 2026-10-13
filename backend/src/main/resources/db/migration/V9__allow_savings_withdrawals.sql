-- Deposits and withdrawals share one table: a positive amount deposits, a negative amount
-- withdraws. Zero is still disallowed, since it would not be a real transaction.
ALTER TABLE savings_deposits DROP CONSTRAINT savings_deposits_amount_check;
ALTER TABLE savings_deposits ADD CONSTRAINT savings_deposits_amount_check CHECK (amount <> 0);
