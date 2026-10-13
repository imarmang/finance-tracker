package com.finance.tracker.savings;

import java.net.URI;
import java.time.YearMonth;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/savings-deposits")
public class SavingsDepositController {

    private final SavingsDepositService service;

    public SavingsDepositController(SavingsDepositService service) {
        this.service = service;
    }

    @GetMapping
    public List<SavingsDeposit> list(@RequestParam(required = false) String month) {
        if (month == null) {
            return service.findAll();
        }
        return service.findByMonth(parseMonth(month));
    }

    @PostMapping
    public ResponseEntity<SavingsDeposit> create(@Valid @RequestBody SavingsDeposit deposit) {
        SavingsDeposit saved = service.create(deposit);
        return ResponseEntity.created(URI.create("/api/savings-deposits/" + saved.id())).body(saved);
    }

    @PutMapping("/{id}")
    public SavingsDeposit update(@PathVariable Long id, @Valid @RequestBody SavingsDeposit deposit) {
        return service.update(id, deposit);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private YearMonth parseMonth(String month) {
        try {
            return YearMonth.parse(month);
        } catch (RuntimeException e) {
            throw new InvalidMonthException(month);
        }
    }
}
