package com.finance.tracker.savings;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SavingsDepositServiceTest {

    @Mock
    private SavingsDepositRepository deposits;

    @Mock
    private SavingsAccountRepository accounts;

    private SavingsDepositService service;

    private static SavingsAccount accountWithBalance(BigDecimal balance) {
        return new SavingsAccount(1L, "Emergency fund", BigDecimal.ZERO, null, balance);
    }

    private void setUp() {
        service = new SavingsDepositService(deposits, accounts);
    }

    @Test
    void withdrawingMoreThanTheBalanceIsRefused() {
        setUp();
        when(accounts.findById(1L)).thenReturn(Optional.of(accountWithBalance(new BigDecimal("100.00"))));
        SavingsDeposit withdrawal = new SavingsDeposit(null, LocalDate.of(2026, 9, 1), 1L, new BigDecimal("-150.00"), "");

        assertThrows(InsufficientSavingsBalanceException.class, () -> service.create(withdrawal));
        verify(deposits, never()).save(withdrawal);
    }

    @Test
    void withdrawingExactlyTheBalanceIsAllowed() {
        setUp();
        when(accounts.findById(1L)).thenReturn(Optional.of(accountWithBalance(new BigDecimal("100.00"))));
        SavingsDeposit withdrawal = new SavingsDeposit(null, LocalDate.of(2026, 9, 1), 1L, new BigDecimal("-100.00"), "");
        when(deposits.save(withdrawal)).thenReturn(withdrawal);

        service.create(withdrawal);

        verify(deposits).save(withdrawal);
    }

    @Test
    void editingAWithdrawalAccountsForItsOwnPreviousAmount() {
        setUp();
        // Balance already reflects a stored -50 withdrawal; raising it to -90 must be checked
        // against the balance as it was before that withdrawal (100 + 50 = 150), not after it.
        SavingsDeposit existing = new SavingsDeposit(5L, LocalDate.of(2026, 9, 1), 1L, new BigDecimal("-50.00"), "");
        lenient().when(deposits.findById(5L)).thenReturn(Optional.of(existing));
        when(accounts.findById(1L)).thenReturn(Optional.of(accountWithBalance(new BigDecimal("100.00"))));
        SavingsDeposit updated = new SavingsDeposit(5L, LocalDate.of(2026, 9, 1), 1L, new BigDecimal("-90.00"), "");
        when(deposits.update(5L, updated)).thenReturn(Optional.of(updated));

        service.update(5L, updated);

        verify(deposits).update(5L, updated);
    }
}
