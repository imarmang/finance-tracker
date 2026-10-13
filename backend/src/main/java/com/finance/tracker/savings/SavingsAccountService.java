package com.finance.tracker.savings;

import java.util.List;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
public class SavingsAccountService {

    private final SavingsAccountRepository repository;
    private final SavingsDepositRepository deposits;

    public SavingsAccountService(SavingsAccountRepository repository, SavingsDepositRepository deposits) {
        this.repository = repository;
        this.deposits = deposits;
    }

    public List<SavingsAccount> findAll() {
        return repository.findAll();
    }

    public SavingsAccount get(Long id) {
        return repository.findById(id).orElseThrow(() -> new SavingsAccountNotFoundException(id));
    }

    public SavingsAccount create(SavingsAccount account) {
        try {
            return repository.save(account);
        } catch (DuplicateKeyException e) {
            throw new SavingsAccountNameTakenException(account.name());
        }
    }

    public SavingsAccount update(Long id, SavingsAccount account) {
        try {
            return repository.update(id, account).orElseThrow(() -> new SavingsAccountNotFoundException(id));
        } catch (DuplicateKeyException e) {
            throw new SavingsAccountNameTakenException(account.name());
        }
    }

    /** Removes a savings account. Refused while it has any deposits, so deposit history always points to a real account. */
    public void delete(Long id) {
        SavingsAccount account = get(id);
        if (deposits.existsByAccount(id)) {
            throw new SavingsAccountInUseException(account.name());
        }
        if (!repository.deleteById(id)) {
            throw new SavingsAccountNotFoundException(id);
        }
    }
}
