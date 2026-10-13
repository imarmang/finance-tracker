package com.finance.tracker.savings;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import com.finance.tracker.expenses.Expense;
import com.finance.tracker.expenses.ExpenseService;
import com.finance.tracker.income.Income;
import com.finance.tracker.income.IncomeService;

import org.springframework.stereotype.Service;

/**
 * Computes the savings summary for a month: how much was saved, broken down by account, and how
 * much profit has not yet been moved into savings. Profit is take-home income minus expenses,
 * the same calculation used elsewhere in the app; this never changes how income, expenses or
 * budgets themselves are calculated.
 */
@Service
public class SavingsSummaryService {

    private static final Pattern MONTH = Pattern.compile("\\d{4}-(0[1-9]|1[0-2])");

    private final SavingsAccountRepository accounts;
    private final SavingsDepositRepository deposits;
    private final IncomeService incomeService;
    private final ExpenseService expenseService;

    public SavingsSummaryService(
            SavingsAccountRepository accounts,
            SavingsDepositRepository deposits,
            IncomeService incomeService,
            ExpenseService expenseService) {
        this.accounts = accounts;
        this.deposits = deposits;
        this.incomeService = incomeService;
        this.expenseService = expenseService;
    }

    public SavingsSummary summarize(String month) {
        if (!MONTH.matcher(month).matches()) {
            throw new InvalidMonthException(month);
        }
        return summarize(YearMonth.parse(month));
    }

    private SavingsSummary summarize(YearMonth month) {
        Map<Long, String> accountNames = new LinkedHashMap<>();
        for (SavingsAccount account : accounts.findAll()) {
            accountNames.put(account.id(), account.name());
        }

        Map<Long, BigDecimal> savedByAccount = new LinkedHashMap<>();
        BigDecimal totalSaved = BigDecimal.ZERO;
        for (SavingsDeposit deposit : deposits.findByMonth(month)) {
            totalSaved = totalSaved.add(deposit.amount());
            savedByAccount.merge(deposit.accountId(), deposit.amount(), BigDecimal::add);
        }

        List<SavingsSummary.AccountSaved> rows = savedByAccount.entrySet().stream()
                .map(e -> new SavingsSummary.AccountSaved(
                        e.getKey(), accountNames.getOrDefault(e.getKey(), "Unknown"), e.getValue()))
                .sorted(Comparator.comparing(SavingsSummary.AccountSaved::amount).reversed())
                .toList();

        BigDecimal profit = profitOf(month);
        return new SavingsSummary(month.toString(), totalSaved, rows, profit, profit.subtract(totalSaved));
    }

    private BigDecimal profitOf(YearMonth month) {
        BigDecimal net = incomeService.findByMonth(month).stream()
                .map(Income::net)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal spent = expenseService.findByMonth(month).stream()
                .map(Expense::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return net.subtract(spent);
    }
}
