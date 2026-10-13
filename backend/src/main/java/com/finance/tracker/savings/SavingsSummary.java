package com.finance.tracker.savings;

import java.math.BigDecimal;
import java.util.List;

/** One month's savings picture: what was saved, into which accounts, and how much is not yet saved. */
public record SavingsSummary(
        String month,
        BigDecimal totalSaved,
        List<AccountSaved> savedByAccount,
        /** Take-home income minus expenses for the month, the same calculation the dashboard uses. */
        BigDecimal profit,
        /** Profit not yet moved into any savings account. Negative when more was saved than earned. */
        BigDecimal notYetSaved
) {

    public record AccountSaved(Long accountId, String name, BigDecimal amount) {
    }
}
