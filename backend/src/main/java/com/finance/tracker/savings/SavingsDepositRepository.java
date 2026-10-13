package com.finance.tracker.savings;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

/** Storage contract for savings deposits. The service depends on this interface only. */
public interface SavingsDepositRepository {

    /** Every deposit, newest first. */
    List<SavingsDeposit> findAll();

    /** Deposits dated in the given month, newest first. */
    List<SavingsDeposit> findByMonth(YearMonth month);

    Optional<SavingsDeposit> findById(Long id);

    /** Stores a new deposit and returns it with a freshly assigned id. Any id on the input is ignored. */
    SavingsDeposit save(SavingsDeposit deposit);

    /** Replaces the deposit stored under {@code id}; empty if there is none. */
    Optional<SavingsDeposit> update(Long id, SavingsDeposit deposit);

    /** @return true if a deposit was removed, false if the id was unknown */
    boolean deleteById(Long id);

    /** @return true if at least one deposit was made into this account */
    boolean existsByAccount(Long accountId);
}
