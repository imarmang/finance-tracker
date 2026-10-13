package com.finance.tracker.income;

import java.util.List;
import java.util.Optional;

/**
 * Storage contract for income. The service depends on this interface only.
 */
public interface IncomeRepository {

    List<Income> findAll();

    Optional<Income> findById(Long id);

    /** Stores a new income entry and returns it with a freshly assigned id. Any id on the input is ignored. */
    Income save(Income income);

    /** Replaces the income entry stored under {@code id}; empty if there is none. */
    Optional<Income> update(Long id, Income income);

    /** @return true if an entry was removed, false if the id was unknown */
    boolean deleteById(Long id);
}
