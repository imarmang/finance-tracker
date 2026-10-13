package com.finance.tracker.income;

import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class IncomeService {

    private final IncomeRepository repository;

    public IncomeService(IncomeRepository repository) {
        this.repository = repository;
    }

    /** Every income entry, newest first. */
    public List<Income> findAll() {
        return repository.findAll();
    }

    /** Income entries dated in the given month, newest first (newest id first on the same day). */
    public List<Income> findByMonth(YearMonth month) {
        return repository.findAll().stream()
                .filter(i -> YearMonth.from(i.date()).equals(month))
                .sorted(Comparator.comparing(Income::date).thenComparing(Income::id).reversed())
                .toList();
    }

    public Income get(Long id) {
        return repository.findById(id).orElseThrow(() -> new IncomeNotFoundException(id));
    }

    public Income create(Income income) {
        return repository.save(income);
    }

    public Income update(Long id, Income income) {
        return repository.update(id, income).orElseThrow(() -> new IncomeNotFoundException(id));
    }

    public void delete(Long id) {
        if (!repository.deleteById(id)) {
            throw new IncomeNotFoundException(id);
        }
    }
}
