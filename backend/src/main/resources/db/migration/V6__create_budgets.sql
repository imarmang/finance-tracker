-- One row per month: the expected take-home pay for that month.
CREATE TABLE monthly_plans (
    month           VARCHAR(7)    PRIMARY KEY CHECK (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
    expected_income NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (expected_income >= 0)
);

-- The monthly spending limit for each category. A category without a row has no limit.
CREATE TABLE budget_lines (
    month    VARCHAR(7)    NOT NULL REFERENCES monthly_plans (month) ON DELETE CASCADE,
    category VARCHAR(40)   NOT NULL,
    amount   NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    PRIMARY KEY (month, category)
);
