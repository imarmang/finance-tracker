-- The expense and income lists sort by date (newest first) and then id. This index lets Postgres
-- read the rows already in that order, so a page of results does not need a full sort.
CREATE INDEX idx_expenses_date_id ON expenses (expense_date DESC, id DESC);
CREATE INDEX idx_income_date_id ON income (income_date DESC, id DESC);

-- Checked before a payment method is deleted, so it must not scan every expense.
CREATE INDEX idx_expenses_card ON expenses (card);

-- The composite indexes above also serve date-only lookups, so the single-column ones are redundant.
DROP INDEX idx_expenses_expense_date;
DROP INDEX idx_income_income_date;
