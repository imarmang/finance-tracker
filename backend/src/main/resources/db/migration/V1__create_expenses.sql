CREATE TABLE expenses (
    id           BIGSERIAL PRIMARY KEY,
    expense_date DATE          NOT NULL,
    vendor       VARCHAR(100)  NOT NULL,
    category     VARCHAR(40)   NOT NULL,
    amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0.25),
    card         VARCHAR(100)  NOT NULL,
    mult         NUMERIC(6,2)  NOT NULL CHECK (mult >= 0),
    note         VARCHAR(200)
);

CREATE INDEX idx_expenses_expense_date ON expenses (expense_date);
