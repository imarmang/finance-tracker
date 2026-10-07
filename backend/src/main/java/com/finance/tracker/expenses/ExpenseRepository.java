package com.finance.tracker.expenses;

import java.util.List;
import java.util.Optional;

/**
 * Storage contract for expenses. The service depends on this interface only,
 * so the in-memory implementation can later be replaced by a JDBC one.
 */
public interface ExpenseRepository {

    List<Expense> findAll();

    Optional<Expense> findById(Long id);

    /** Stores a new expense and returns it with a freshly assigned id. Any id on the input is ignored. */
    Expense save(Expense expense);

    /** Replaces the expense stored under {@code id}; empty if there is none. */
    Optional<Expense> update(Long id, Expense expense);

    /** @return true if an expense was removed, false if the id was unknown */
    boolean deleteById(Long id);

    /** @return true if at least one expense was paid with the card with this exact name */
    boolean existsByCard(String card);
}
