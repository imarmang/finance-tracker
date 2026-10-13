package com.finance.tracker.savings;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import com.finance.tracker.expenses.Expense;
import com.finance.tracker.expenses.ExpenseService;
import com.finance.tracker.income.Income;
import com.finance.tracker.income.IncomeService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SavingsSummaryServiceTest {

    @Mock
    private SavingsAccountRepository accounts;

    @Mock
    private SavingsDepositRepository deposits;

    @Mock
    private IncomeService incomeService;

    @Mock
    private ExpenseService expenseService;

    private SavingsSummaryService service;

    private static final YearMonth MONTH = YearMonth.of(2026, 9);

    private void setUp() {
        service = new SavingsSummaryService(accounts, deposits, incomeService, expenseService);
    }

    /** A paycheck with no taxes nets to exactly its gross amount, so profit equals gross minus expenses. */
    private static Income paycheck(BigDecimal gross) {
        return new Income(1L, LocalDate.of(2026, 9, 5), "Paycheck", gross,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, "");
    }

    private static Expense expense(BigDecimal amount) {
        return new Expense(1L, LocalDate.of(2026, 9, 10), "Vendor", Expense.Category.MISCELLANEOUS,
                amount, "Debit", BigDecimal.ZERO, "");
    }

    private static SavingsDeposit deposit(Long accountId, BigDecimal amount) {
        return new SavingsDeposit(null, LocalDate.of(2026, 9, 15), accountId, amount, "");
    }

    @Test
    void profit2200WithDeposits500And305GivesTotalSaved805AndNotYetSaved1395() {
        setUp();
        when(incomeService.findByMonth(MONTH)).thenReturn(List.of(paycheck(new BigDecimal("2200.00"))));
        when(expenseService.findByMonth(MONTH)).thenReturn(List.of());
        when(accounts.findAll()).thenReturn(List.of(
                new SavingsAccount(10L, "Emergency fund", BigDecimal.ZERO, null, BigDecimal.ZERO),
                new SavingsAccount(20L, "Vacation", BigDecimal.ZERO, null, BigDecimal.ZERO)));
        when(deposits.findByMonth(MONTH)).thenReturn(List.of(
                deposit(10L, new BigDecimal("500.00")),
                deposit(20L, new BigDecimal("305.00"))));

        SavingsSummary summary = service.summarize("2026-09");

        assertEquals(0, new BigDecimal("805.00").compareTo(summary.totalSaved()));
        assertEquals(0, new BigDecimal("2200.00").compareTo(summary.profit()));
        assertEquals(0, new BigDecimal("1395.00").compareTo(summary.notYetSaved()));
        assertEquals(2, summary.savedByAccount().size());
    }

    @Test
    void profitSubtractsExpensesFromTakeHomeIncome() {
        setUp();
        when(incomeService.findByMonth(MONTH)).thenReturn(List.of(paycheck(new BigDecimal("3000.00"))));
        when(expenseService.findByMonth(MONTH)).thenReturn(List.of(expense(new BigDecimal("1200.00"))));
        when(accounts.findAll()).thenReturn(List.of());
        when(deposits.findByMonth(any())).thenReturn(List.of());

        SavingsSummary summary = service.summarize("2026-09");

        assertEquals(0, new BigDecimal("1800.00").compareTo(summary.profit()));
        assertEquals(0, BigDecimal.ZERO.compareTo(summary.totalSaved()));
        assertEquals(0, new BigDecimal("1800.00").compareTo(summary.notYetSaved()));
    }

    @Test
    void rejectsAMalformedMonth() {
        setUp();
        org.junit.jupiter.api.Assertions.assertThrows(
                InvalidMonthException.class, () -> service.summarize("not-a-month"));
    }
}
