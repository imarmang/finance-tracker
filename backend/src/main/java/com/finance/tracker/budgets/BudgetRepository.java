package com.finance.tracker.budgets;

import java.util.List;

/** Storage contract for monthly budgets. */
public interface BudgetRepository {

    /** Every month that has a budget, oldest first. */
    List<MonthBudget> findAll();

    /** Replaces everything stored for the month and returns what was stored. */
    MonthBudget save(MonthBudget budget);
}
