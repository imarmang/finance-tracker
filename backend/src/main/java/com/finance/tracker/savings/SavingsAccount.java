package com.finance.tracker.savings;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** A savings account the user tracks, with an optional goal. */
public record SavingsAccount(
        Long id,
        @NotBlank @Size(max = 60) String name,
        /** The bank or institution holding the money. */
        @NotBlank @Size(max = 60) String bank,
        /** True for a high-yield savings account. */
        boolean hysa,
        @NotNull @DecimalMin("0") @Digits(integer = 10, fraction = 2) BigDecimal openingBalance,
        /** Optional; may be null when the account has no savings goal. */
        @DecimalMin("0") @Digits(integer = 10, fraction = 2) BigDecimal goalAmount,
        /** Opening balance plus every deposit into this account. Ignored on input; the server computes it. */
        BigDecimal balance
) {
}
