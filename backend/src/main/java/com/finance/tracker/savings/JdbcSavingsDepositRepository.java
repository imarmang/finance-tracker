package com.finance.tracker.savings;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcSavingsDepositRepository implements SavingsDepositRepository {

    private static final String SELECT = """
            select id, deposit_date, account_id, amount, note
            from savings_deposits
            """;

    private final JdbcClient jdbc;

    public JdbcSavingsDepositRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<SavingsDeposit> findAll() {
        return jdbc.sql(SELECT + "order by deposit_date desc, id desc")
                .query(JdbcSavingsDepositRepository::toDeposit)
                .list();
    }

    @Override
    public List<SavingsDeposit> findByMonth(YearMonth month) {
        LocalDate start = month.atDay(1);
        LocalDate end = month.plusMonths(1).atDay(1);
        return jdbc.sql(SELECT + "where deposit_date >= :start and deposit_date < :end order by deposit_date desc, id desc")
                .param("start", start)
                .param("end", end)
                .query(JdbcSavingsDepositRepository::toDeposit)
                .list();
    }

    @Override
    public Optional<SavingsDeposit> findById(Long id) {
        return jdbc.sql(SELECT + "where id = :id")
                .param("id", id)
                .query(JdbcSavingsDepositRepository::toDeposit)
                .optional();
    }

    @Override
    public SavingsDeposit save(SavingsDeposit deposit) {
        Long id = bind("""
                insert into savings_deposits (deposit_date, account_id, amount, note)
                values (:date, :accountId, :amount, :note)
                returning id
                """, deposit)
                .query(Long.class)
                .single();
        return findById(id).orElseThrow();
    }

    @Override
    public Optional<SavingsDeposit> update(Long id, SavingsDeposit deposit) {
        int rows = bind("""
                update savings_deposits
                set deposit_date = :date, account_id = :accountId, amount = :amount, note = :note
                where id = :id
                """, deposit)
                .param("id", id)
                .update();
        return rows == 0 ? Optional.empty() : findById(id);
    }

    @Override
    public boolean deleteById(Long id) {
        return jdbc.sql("delete from savings_deposits where id = :id")
                .param("id", id)
                .update() > 0;
    }

    @Override
    public boolean existsByAccount(Long accountId) {
        return jdbc.sql("select exists (select 1 from savings_deposits where account_id = :accountId)")
                .param("accountId", accountId)
                .query(Boolean.class)
                .single();
    }

    private JdbcClient.StatementSpec bind(String sql, SavingsDeposit deposit) {
        return jdbc.sql(sql)
                .param("date", deposit.date())
                .param("accountId", deposit.accountId())
                .param("amount", deposit.amount())
                .param("note", deposit.note(), Types.VARCHAR);
    }

    private static SavingsDeposit toDeposit(ResultSet rs, int rowNum) throws SQLException {
        return new SavingsDeposit(
                rs.getLong("id"),
                rs.getObject("deposit_date", LocalDate.class),
                rs.getLong("account_id"),
                rs.getBigDecimal("amount"),
                rs.getString("note"));
    }
}
