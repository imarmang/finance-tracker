package com.finance.tracker.budgets;

import java.math.BigDecimal;
import java.util.Map;

/** The budget for one month: expected take-home pay, and the spending limit for each category. */
public record MonthBudget(
        /** Month key in the form yyyy-MM. */
        String month,
        BigDecimal expectedIncome,
        /** Spending limit keyed by expense category label. */
        Map<String, BigDecimal> categories
) {
}
