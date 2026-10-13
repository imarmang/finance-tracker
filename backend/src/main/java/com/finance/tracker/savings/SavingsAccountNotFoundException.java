package com.finance.tracker.savings;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class SavingsAccountNotFoundException extends RuntimeException {

    public SavingsAccountNotFoundException(Long id) {
        super("Savings account " + id + " not found");
    }
}
