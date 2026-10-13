package com.finance.tracker.savings;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class SavingsDepositNotFoundException extends RuntimeException {

    public SavingsDepositNotFoundException(Long id) {
        super("Savings deposit " + id + " not found");
    }
}
