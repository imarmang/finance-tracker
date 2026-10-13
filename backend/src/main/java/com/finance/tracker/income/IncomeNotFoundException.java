package com.finance.tracker.income;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class IncomeNotFoundException extends RuntimeException {

    public IncomeNotFoundException(Long id) {
        super("Income " + id + " not found");
    }
}
