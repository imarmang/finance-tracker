package com.finance.tracker.savings;

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
        requireAccount(deposit.accountId());
        return repository.save(deposit);
    }

    public SavingsDeposit update(Long id, SavingsDeposit deposit) {
        requireAccount(deposit.accountId());
        return repository.update(id, deposit).orElseThrow(() -> new SavingsDepositNotFoundException(id));
    }

    public void delete(Long id) {
        if (!repository.deleteById(id)) {
            throw new SavingsDepositNotFoundException(id);
        }
    }

    /** A deposit must point at a real account, since the FK would otherwise surface as an opaque database error. */
    private void requireAccount(Long accountId) {
        if (accounts.findById(accountId).isEmpty()) {
            throw new SavingsAccountNotFoundException(accountId);
        }
    }
}
