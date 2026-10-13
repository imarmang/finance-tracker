package com.finance.tracker.paymentmethods;

import java.util.List;

import com.finance.tracker.expenses.ExpenseRepository;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
public class PaymentMethodService {

    private final PaymentMethodRepository repository;
    private final ExpenseRepository expenses;

    public PaymentMethodService(PaymentMethodRepository repository, ExpenseRepository expenses) {
        this.repository = repository;
        this.expenses = expenses;
    }

    public List<PaymentMethod> findAll() {
        return repository.findAll();
    }

    public PaymentMethod get(Long id) {
        return repository.findById(id).orElseThrow(() -> new PaymentMethodNotFoundException(id));
    }

    public PaymentMethod create(PaymentMethod method) {
        try {
            return repository.save(method);
        } catch (DuplicateKeyException e) {
            throw new PaymentMethodNameTakenException(method.name());
        }
    }

    public PaymentMethod update(Long id, PaymentMethod method) {
        try {
            return repository.update(id, method).orElseThrow(() -> new PaymentMethodNotFoundException(id));
        } catch (DuplicateKeyException e) {
            throw new PaymentMethodNameTakenException(method.name());
        }
    }

    /**
     * Removes a payment method. Refused while any expense was paid with it, because expenses
     * refer to a card by name and the history of what was paid with it must stay accurate.
     */
    public void delete(Long id) {
        PaymentMethod method = get(id);
        if (expenses.existsByCard(method.name())) {
            throw new PaymentMethodInUseException(method.name());
        }
        if (!repository.deleteById(id)) {
            throw new PaymentMethodNotFoundException(id);
        }
    }
}
