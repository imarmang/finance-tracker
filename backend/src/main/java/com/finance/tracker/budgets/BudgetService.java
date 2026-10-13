package com.finance.tracker.budgets;

import java.util.List;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

@Service
public class BudgetService {

    private static final Pattern MONTH = Pattern.compile("\\d{4}-(0[1-9]|1[0-2])");

    private final BudgetRepository repository;

    public BudgetService(BudgetRepository repository) {
        this.repository = repository;
    }

    public List<MonthBudget> findAll() {
        return repository.findAll();
    }

    public MonthBudget save(String month, BudgetInput input) {
        if (!MONTH.matcher(month).matches()) {
            throw new InvalidMonthException(month);
        }
        return repository.save(new MonthBudget(month, input.expectedIncome(), input.categories()));
    }
}
