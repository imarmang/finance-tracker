package com.finance.tracker.savings;

import java.util.List;
import java.util.Optional;

/** Storage contract for savings accounts. The service depends on this interface only. */
public interface SavingsAccountRepository {

    /** Every account with its current balance, ordered by id. */
    List<SavingsAccount> findAll();

    Optional<SavingsAccount> findById(Long id);

    /** Stores a new account and returns it with a freshly assigned id. Any id or balance on the input is ignored. */
    SavingsAccount save(SavingsAccount account);

    /** Replaces the account stored under {@code id}; empty if there is none. */
    Optional<SavingsAccount> update(Long id, SavingsAccount account);

    /** @return true if an account was removed, false if the id was unknown */
    boolean deleteById(Long id);
}
