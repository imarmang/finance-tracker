package com.finance.tracker.savings;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SavingsAccountNameTakenException extends RuntimeException {

    public SavingsAccountNameTakenException(String name) {
        super("A savings account named " + name + " already exists");
    }
}
