package com.finance.tracker.savings;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class SavingsDepositService {

    private final SavingsDepositRepository repository;
    private final SavingsAccountRepository accounts;

    public SavingsDepositService(SavingsDepositRepository repository, SavingsAccountRepository accounts) {
        this.repository = repository;
        this.accounts = accounts;
    }

    public List<SavingsDeposit> findAll() {
        return repository.findAll();
    }

    public List<SavingsDeposit> findByMonth(YearMonth month) {
        return repository.findByMonth(month);
    }

    public SavingsDeposit get(Long id) {
        return repository.findById(id).orElseThrow(() -> new SavingsDepositNotFoundException(id));
    }

    public SavingsDeposit create(SavingsDeposit deposit) {
        SavingsAccount account = requireAccount(deposit.accountId());
        requireSufficientBalance(account, account.balance(), deposit.amount());
        return repository.save(deposit);
    }

    public SavingsDeposit update(Long id, SavingsDeposit deposit) {
        SavingsDeposit existing = get(id);
        SavingsAccount account = requireAccount(deposit.accountId());
        BigDecimal balanceBeforeThisOne = account.id().equals(existing.accountId())
                ? account.balance().subtract(existing.amount())
                : account.balance();
        requireSufficientBalance(account, balanceBeforeThisOne, deposit.amount());
        return repository.update(id, deposit).orElseThrow(() -> new SavingsDepositNotFoundException(id));
    }

    public void delete(Long id) {
        if (!repository.deleteById(id)) {
            throw new SavingsDepositNotFoundException(id);
        }
    }

    /** A deposit must point at a real account, since the FK would otherwise surface as an opaque database error. */
    private SavingsAccount requireAccount(Long accountId) {
        return accounts.findById(accountId).orElseThrow(() -> new SavingsAccountNotFoundException(accountId));
    }

    /** A withdrawal (a negative amount) is refused if it would take the account below a zero balance. */
    private void requireSufficientBalance(SavingsAccount account, BigDecimal balanceBeforeThisOne, BigDecimal amount) {
        if (balanceBeforeThisOne.add(amount).signum() < 0) {
            throw new InsufficientSavingsBalanceException(account.name());
        }
    }
}
