package com.finance.tracker.savings;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class InsufficientSavingsBalanceException extends RuntimeException {

    public InsufficientSavingsBalanceException(String accountName) {
        super("Withdrawing that much would take " + accountName + " below a zero balance");
    }
}
