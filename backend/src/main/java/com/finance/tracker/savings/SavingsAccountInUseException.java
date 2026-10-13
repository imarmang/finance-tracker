package com.finance.tracker.savings;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SavingsAccountInUseException extends RuntimeException {

    public SavingsAccountInUseException(String name) {
        super(name + " has deposits recorded against it, so it cannot be deleted");
    }
}
