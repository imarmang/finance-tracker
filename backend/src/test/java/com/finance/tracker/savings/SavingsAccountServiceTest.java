package com.finance.tracker.savings;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class SavingsAccountServiceTest {

    @Mock
    private SavingsAccountRepository accounts;

    @Mock
    private SavingsDepositRepository deposits;

    @Test
    void deletingAnAccountWithDepositsIsRefused() {
        SavingsAccountService service = new SavingsAccountService(accounts, deposits);
        SavingsAccount account = new SavingsAccount(1L, "Emergency fund", "Ally", true, BigDecimal.ZERO, null, BigDecimal.ZERO);
        when(accounts.findById(1L)).thenReturn(Optional.of(account));
        when(deposits.existsByAccount(1L)).thenReturn(true);

        assertThrows(SavingsAccountInUseException.class, () -> service.delete(1L));
        verify(accounts, never()).deleteById(1L);

        ResponseStatus status = SavingsAccountInUseException.class.getAnnotation(ResponseStatus.class);
        assertEquals(HttpStatus.CONFLICT, status.value());
    }

    @Test
    void deletingAnAccountWithNoDepositsSucceeds() {
        SavingsAccountService service = new SavingsAccountService(accounts, deposits);
        SavingsAccount account = new SavingsAccount(1L, "Emergency fund", "Ally", true, BigDecimal.ZERO, null, BigDecimal.ZERO);
        when(accounts.findById(1L)).thenReturn(Optional.of(account));
        when(deposits.existsByAccount(1L)).thenReturn(false);
        when(accounts.deleteById(1L)).thenReturn(true);

        service.delete(1L);

        verify(accounts).deleteById(1L);
    }
}
