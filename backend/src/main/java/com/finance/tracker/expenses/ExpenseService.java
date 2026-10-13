package com.finance.tracker.expenses;

import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ExpenseService {

    private final ExpenseRepository repository;

    public ExpenseService(ExpenseRepository repository) {
        this.repository = repository;
    }

    /** Every expense, newest first. */
    public List<Expense> findAll() {
        return repository.findAll();
    }

    /** Expenses dated in the given month, newest first (newest id first on the same day). */
    public List<Expense> findByMonth(YearMonth month) {
        return repository.findAll().stream()
                .filter(e -> YearMonth.from(e.date()).equals(month))
                .sorted(Comparator.comparing(Expense::date).thenComparing(Expense::id).reversed())
                .toList();
    }

    public Expense get(Long id) {
        return repository.findById(id).orElseThrow(() -> new ExpenseNotFoundException(id));
    }

    public Expense create(Expense expense) {
        return repository.save(expense);
    }

    public Expense update(Long id, Expense expense) {
        return repository.update(id, expense).orElseThrow(() -> new ExpenseNotFoundException(id));
    }

    public void delete(Long id) {
        if (!repository.deleteById(id)) {
            throw new ExpenseNotFoundException(id);
        }
    }
}
