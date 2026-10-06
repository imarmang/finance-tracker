package com.finance.tracker.expenses;

import java.math.BigDecimal;
import java.time.LocalDate;

public record Expense(
        Long id,
        LocalDate date,
        String vendor,
        String category,
        BigDecimal amount,
        String card
) {}
