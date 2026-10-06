package com.finance.tracker.income;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record Income(
        Long id,
        @NotNull LocalDate date,
        @NotBlank @Size(max = 40) String source,
        @NotNull @DecimalMin(value = "0.25", inclusive = false) @Digits(integer = 10, fraction = 2) BigDecimal gross,
        @NotNull @DecimalMin("0") @Digits(integer = 10, fraction = 2) BigDecimal fed,
        @NotNull @DecimalMin("0") @Digits(integer = 10, fraction = 2) BigDecimal ss,
        @NotNull @DecimalMin("0") @Digits(integer = 10, fraction = 2) BigDecimal medicare,
        @NotNull @DecimalMin("0") @Digits(integer = 10, fraction = 2) BigDecimal stateTax,
        @NotNull @DecimalMin("0") @Digits(integer = 10, fraction = 2) BigDecimal sdi,
        /** Optional; may be null. */
        @Size(max = 200) String note
) {

    /** Taxes and deductions added together. Only valid when every tax field is present. */
    @JsonIgnore
    BigDecimal taxes() {
        return fed.add(ss).add(medicare).add(stateTax).add(sdi);
    }

    /** Taxes cannot be more than the gross pay. Skipped when a field is missing, since @NotNull reports that. */
    @AssertTrue(message = "Taxes and deductions cannot be more than the gross amount")
    @JsonIgnore
    public boolean isTaxesWithinGross() {
        if (gross == null || fed == null || ss == null || medicare == null || stateTax == null || sdi == null) {
            return true;
        }
        return taxes().compareTo(gross) <= 0;
    }
}
