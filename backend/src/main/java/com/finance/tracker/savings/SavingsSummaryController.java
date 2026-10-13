package com.finance.tracker.savings;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/savings-summary")
public class SavingsSummaryController {

    private final SavingsSummaryService service;

    public SavingsSummaryController(SavingsSummaryService service) {
        this.service = service;
    }

    @GetMapping
    public SavingsSummary get(@RequestParam String month) {
        return service.summarize(month);
    }
}
