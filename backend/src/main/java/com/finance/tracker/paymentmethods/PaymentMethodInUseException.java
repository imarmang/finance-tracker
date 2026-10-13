package com.finance.tracker.paymentmethods;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class PaymentMethodInUseException extends RuntimeException {

    public PaymentMethodInUseException(String name) {
        super(name + " has transactions paid with it, so it cannot be deleted");
    }
}
