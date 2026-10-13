package com.finance.tracker.paymentmethods;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PaymentMethodNotFoundException extends RuntimeException {

    public PaymentMethodNotFoundException(Long id) {
        super("Payment method " + id + " not found");
    }
}
