-- Fixed bills vs non-fixed bills, derived from the category so it always matches Expense.Category.group().
ALTER TABLE expenses
    ADD COLUMN category_group VARCHAR(20) GENERATED ALWAYS AS (
        CASE
            WHEN category IN ('RENT', 'CAR_PAYMENT', 'CAR_INSURANCE', 'ELECTRICITY', 'WATER_SEWER',
                              'RENTERS_INSURANCE', 'PHONE_BILL', 'SUBSCRIPTIONS', 'HEALTH_INSURANCE',
                              'DENTAL_INSURANCE', 'VISION_INSURANCE', 'HSA_PRETAX')
                THEN 'FIXED_BILLS'
            ELSE 'NON_FIXED_BILLS'
        END
    ) STORED;
