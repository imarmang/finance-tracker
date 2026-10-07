CREATE TABLE payment_methods (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(60)  NOT NULL,
    kind         VARCHAR(20)  NOT NULL CHECK (kind IN ('CREDIT_CARD', 'DEBIT_CARD', 'CHECKING', 'CASH', 'OTHER')),
    default_mult NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (default_mult >= 0)
);

-- Names are unique regardless of case, so "amex" and "AMEX" cannot both exist.
CREATE UNIQUE INDEX uq_payment_methods_name ON payment_methods (lower(name));

CREATE TABLE payment_method_rules (
    payment_method_id BIGINT       NOT NULL REFERENCES payment_methods (id) ON DELETE CASCADE,
    category          VARCHAR(40)  NOT NULL,
    mult              NUMERIC(6,2) NOT NULL CHECK (mult >= 0),
    PRIMARY KEY (payment_method_id, category)
);

-- The methods the app shipped with, so existing expenses keep matching them by name.
INSERT INTO payment_methods (name, kind, default_mult) VALUES
    ('Chase Freedom Unlimited', 'CREDIT_CARD', 1.5),
    ('Discover It',             'CREDIT_CARD', 1),
    ('Apple Card',              'CREDIT_CARD', 1),
    ('AMEX',                    'CREDIT_CARD', 1),
    ('Debit',                   'DEBIT_CARD',  0),
    ('Check',                   'CHECKING',    0);

INSERT INTO payment_method_rules (payment_method_id, category, mult)
SELECT id, 'Travel', 3 FROM payment_methods WHERE name = 'Apple Card'
UNION ALL
SELECT id, 'Dining', 4 FROM payment_methods WHERE name = 'AMEX';
