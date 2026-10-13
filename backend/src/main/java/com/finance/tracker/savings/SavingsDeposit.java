package com.finance.tracker.savings;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SavingsDeposit(
        Long id,
        @NotNull LocalDate date,
        @NotNull Long accountId,
        @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 10, fraction = 2) BigDecimal amount,
        /** Optional; may be null. */
        @Size(max = 200) String note
) {
}
