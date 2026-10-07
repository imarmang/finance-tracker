package com.finance.tracker.expenses;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonValue;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record Expense(
        Long id,
        @NotNull LocalDate date,
        @NotBlank @Size(max = 100) String vendor,
        @NotNull Category category,
        @NotNull @DecimalMin(value = "0.25", inclusive = false) @Digits(integer = 10, fraction = 2) BigDecimal amount,
        @NotBlank @Size(max = 100) String card,
        @NotNull @DecimalMin("0") BigDecimal mult,
        /** Optional; may be null. */
        @Size(max = 200) String note
) {

    public enum Group {
        FIXED_BILLS,
        NON_FIXED_BILLS
    }

    /** Matches the category names used by the frontend, so the API keeps sending and receiving them unchanged. */
    public enum Category {
        RENT("Rent", Group.FIXED_BILLS),
        CAR_PAYMENT("Car Payment", Group.FIXED_BILLS),
        CAR_INSURANCE("Car Insurance", Group.FIXED_BILLS),
        ELECTRICITY("Electricity", Group.FIXED_BILLS),
        RENTERS_INSURANCE("Renters Insurance", Group.FIXED_BILLS),
        PHONE_BILL("Phone Bill", Group.FIXED_BILLS),
        SUBSCRIPTIONS("Subscriptions", Group.FIXED_BILLS),
        HEALTH_INSURANCE("Health Insurance", Group.FIXED_BILLS),
        DENTAL_INSURANCE("Dental Insurance", Group.FIXED_BILLS),
        VISION_INSURANCE("Vision Insurance", Group.FIXED_BILLS),
        HSA_PRETAX("HSA Pretax", Group.FIXED_BILLS),
        GROCERIES("Groceries", Group.NON_FIXED_BILLS),
        DINING("Dining", Group.NON_FIXED_BILLS),
        GAS_FOR_CAR("Gas For Car", Group.NON_FIXED_BILLS),
        TRAVEL("Travel", Group.NON_FIXED_BILLS),
        SHOPPING("Shopping", Group.NON_FIXED_BILLS),
        DRUG_STORE("Drug Store", Group.NON_FIXED_BILLS),
        HOUSE_SUPPLIES("House Supplies", Group.NON_FIXED_BILLS),
        COFFEE("Coffee", Group.NON_FIXED_BILLS),
        MISCELLANEOUS("Miscellaneous", Group.NON_FIXED_BILLS);

        private final String label;
        private final Group group;

        Category(String label, Group group) {
            this.label = label;
            this.group = group;
        }

        @JsonValue
        public String label() {
            return label;
        }

        public Group group() {
            return group;
        }
    }
}
