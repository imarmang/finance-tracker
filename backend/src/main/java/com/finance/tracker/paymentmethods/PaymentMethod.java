package com.finance.tracker.paymentmethods;

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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** A way the user pays: a credit card, debit card, checking account, cash, or anything else. */
public record PaymentMethod(
        Long id,
        @NotBlank @Size(max = 60) String name,
        @NotNull Kind kind,
        /** Points per dollar for purchases without a bonus rule. Only credit cards earn points. */
        @NotNull @DecimalMin("0") @Digits(integer = 4, fraction = 2) BigDecimal defaultMult,
        /** Bonus multipliers keyed by expense category label. */
        @NotNull Map<String, BigDecimal> rules
) {

    public enum Kind {
        CREDIT_CARD,
        DEBIT_CARD,
        CHECKING,
        CASH,
        OTHER
    }

    private static final Set<String> CATEGORY_LABELS = Arrays.stream(Expense.Category.values())
            .map(Expense.Category::label)
            .collect(Collectors.toUnmodifiableSet());

    /** Only credit cards can earn points, so other kinds must have no multipliers at all. */
    @AssertTrue(message = "Only credit cards can earn points")
    @JsonIgnore
    public boolean isRewardsAllowedForKind() {
        if (kind == null || defaultMult == null || rules == null) {
            return true;
        }
        if (kind == Kind.CREDIT_CARD) {
            return true;
        }
        return defaultMult.signum() == 0 && rules.isEmpty();
    }

    /** Bonus categories must be real expense categories, and every multiplier must be present and non-negative. */
    @AssertTrue(message = "Bonus rules need a known category and a multiplier of 0 or more")
    @JsonIgnore
    public boolean isRulesValid() {
        if (rules == null) {
            return true;
        }
        return rules.entrySet().stream().allMatch(e ->
                CATEGORY_LABELS.contains(e.getKey())
                        && e.getValue() != null
                        && e.getValue().signum() >= 0
                        && e.getValue().scale() <= 2);
    }
}
