CREATE TABLE income (
    id           BIGSERIAL PRIMARY KEY,
    income_date  DATE          NOT NULL,
    source       VARCHAR(40)   NOT NULL,
    gross        NUMERIC(12,2) NOT NULL CHECK (gross > 0.25),
    fed          NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (fed >= 0),
    ss           NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (ss >= 0),
    medicare     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (medicare >= 0),
    state_tax    NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (state_tax >= 0),
    sdi          NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (sdi >= 0),
    note         VARCHAR(200)
);

CREATE INDEX idx_income_income_date ON income (income_date);
