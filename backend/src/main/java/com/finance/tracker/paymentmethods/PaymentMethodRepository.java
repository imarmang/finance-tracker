package com.finance.tracker.paymentmethods;

import java.util.List;
import java.util.Optional;

/**
 * Storage contract for payment methods. The service depends on this interface only.
 */
public interface PaymentMethodRepository {

    List<PaymentMethod> findAll();

    Optional<PaymentMethod> findById(Long id);

    /** Stores a new payment method and returns it with a freshly assigned id. Any id on the input is ignored. */
    PaymentMethod save(PaymentMethod method);

    /** Replaces the method stored under {@code id}; empty if there is none. */
    Optional<PaymentMethod> update(Long id, PaymentMethod method);

    /** @return true if a method was removed, false if the id was unknown */
    boolean deleteById(Long id);
}
