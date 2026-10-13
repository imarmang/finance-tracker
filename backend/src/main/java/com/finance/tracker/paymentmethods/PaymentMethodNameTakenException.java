package com.finance.tracker.paymentmethods;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class PaymentMethodNameTakenException extends RuntimeException {

    public PaymentMethodNameTakenException(String name) {
        super("A payment method named " + name + " already exists");
    }
}
