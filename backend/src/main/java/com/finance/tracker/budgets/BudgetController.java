package com.finance.tracker.budgets;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @GetMapping
    public List<MonthBudget> list() {
        return service.findAll();
    }

    /** Replaces the budget for one month: its expected take-home pay and every category limit. */
    @PutMapping("/{month}")
    public MonthBudget save(@PathVariable String month, @Valid @RequestBody BudgetInput input) {
        return service.save(month, input);
    }
}
