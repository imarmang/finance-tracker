package com.finance.tracker.savings;

import java.net.URI;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/savings-accounts")
public class SavingsAccountController {

    private final SavingsAccountService service;

    public SavingsAccountController(SavingsAccountService service) {
        this.service = service;
    }

    @GetMapping
    public List<SavingsAccount> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public SavingsAccount get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<SavingsAccount> create(@Valid @RequestBody SavingsAccount account) {
        SavingsAccount saved = service.create(account);
        return ResponseEntity.created(URI.create("/api/savings-accounts/" + saved.id())).body(saved);
    }

    @PutMapping("/{id}")
    public SavingsAccount update(@PathVariable Long id, @Valid @RequestBody SavingsAccount account) {
        return service.update(id, account);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
