package com.finance.tracker.paymentmethods;

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
@RequestMapping("/api/payment-methods")
public class PaymentMethodController {

    private final PaymentMethodService service;

    public PaymentMethodController(PaymentMethodService service) {
        this.service = service;
    }

    @GetMapping
    public List<PaymentMethod> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public PaymentMethod get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<PaymentMethod> create(@Valid @RequestBody PaymentMethod method) {
        PaymentMethod saved = service.create(method);
        return ResponseEntity.created(URI.create("/api/payment-methods/" + saved.id())).body(saved);
    }

    @PutMapping("/{id}")
    public PaymentMethod update(@PathVariable Long id, @Valid @RequestBody PaymentMethod method) {
        return service.update(id, method);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
