package com.finance.tracker.budgets;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.finance.tracker.expenses.Expense;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

/** The body of a budget save. The month comes from the URL. */
public record BudgetInput(
        @NotNull @DecimalMin("0") @Digits(integer = 10, fraction = 2) BigDecimal expectedIncome,
        @NotNull Map<String, BigDecimal> categories
) {

    private static final Set<String> CATEGORY_LABELS = Arrays.stream(Expense.Category.values())
            .map(Expense.Category::label)
            .collect(Collectors.toUnmodifiableSet());

    /** Every budgeted category must be a known category, and every limit must be 0 or more with at most two decimals. */
    @AssertTrue(message = "Budget categories must be known and limits must be 0 or more")
    @JsonIgnore
    public boolean isCategoriesValid() {
        if (categories == null) {
            return true;
        }
        return categories.entrySet().stream().allMatch(e ->
                CATEGORY_LABELS.contains(e.getKey())
                        && e.getValue() != null
                        && e.getValue().signum() >= 0
                        && e.getValue().scale() <= 2);
    }
}
