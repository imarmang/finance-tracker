package com.finance.tracker.budgets;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidMonthException extends RuntimeException {

    public InvalidMonthException(String month) {
        super("Month must look like 2026-10, but was " + month);
    }
}
