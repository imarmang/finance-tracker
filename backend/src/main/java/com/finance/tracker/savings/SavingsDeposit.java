package com.finance.tracker.savings;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** A deposit into, or withdrawal from, a savings account. A positive amount deposits; a negative amount withdraws. */
public record SavingsDeposit(
        Long id,
        @NotNull LocalDate date,
        @NotNull Long accountId,
        @NotNull @Digits(integer = 10, fraction = 2) BigDecimal amount,
        /** Optional; may be null. */
        @Size(max = 200) String note
) {

    /** Zero would not be a real deposit or withdrawal. Skipped when the amount is missing; @NotNull reports that. */
    @AssertTrue(message = "Amount must not be zero")
    @JsonIgnore
    public boolean isAmountNonZero() {
        return amount == null || amount.signum() != 0;
    }
}
