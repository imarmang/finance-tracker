package com.finance.tracker.savings;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcSavingsAccountRepository implements SavingsAccountRepository {

    private static final String SELECT = """
            select a.id, a.name, a.bank, a.is_hysa, a.opening_balance, a.goal_amount,
                   a.opening_balance + coalesce(sum(d.amount), 0) as balance
            from savings_accounts a
            left join savings_deposits d on d.account_id = a.id
            """;

    private static final String GROUP_BY =
            "group by a.id, a.name, a.bank, a.is_hysa, a.opening_balance, a.goal_amount";

    private final JdbcClient jdbc;

    public JdbcSavingsAccountRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<SavingsAccount> findAll() {
        return jdbc.sql(SELECT + GROUP_BY + " order by a.id")
                .query(JdbcSavingsAccountRepository::toAccount)
                .list();
    }

    @Override
    public Optional<SavingsAccount> findById(Long id) {
        return jdbc.sql(SELECT + "where a.id = :id " + GROUP_BY)
                .param("id", id)
                .query(JdbcSavingsAccountRepository::toAccount)
                .optional();
    }

    @Override
    public SavingsAccount save(SavingsAccount account) {
        Long id = bind("""
                insert into savings_accounts (name, bank, is_hysa, opening_balance, goal_amount)
                values (:name, :bank, :hysa, :openingBalance, :goalAmount)
                returning id
                """, account)
                .query(Long.class)
                .single();
        return findById(id).orElseThrow();
    }

    @Override
    public Optional<SavingsAccount> update(Long id, SavingsAccount account) {
        int rows = bind("""
                update savings_accounts
                set name = :name, bank = :bank, is_hysa = :hysa,
                    opening_balance = :openingBalance, goal_amount = :goalAmount
                where id = :id
                """, account)
                .param("id", id)
                .update();
        return rows == 0 ? Optional.empty() : findById(id);
    }

    @Override
    public boolean deleteById(Long id) {
        return jdbc.sql("delete from savings_accounts where id = :id")
                .param("id", id)
                .update() > 0;
    }

    private JdbcClient.StatementSpec bind(String sql, SavingsAccount account) {
        return jdbc.sql(sql)
                .param("name", account.name())
                .param("bank", account.bank())
                .param("hysa", account.hysa())
                .param("openingBalance", account.openingBalance())
                .param("goalAmount", account.goalAmount(), Types.NUMERIC);
    }

    private static SavingsAccount toAccount(ResultSet rs, int rowNum) throws SQLException {
        return new SavingsAccount(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("bank"),
                rs.getBoolean("is_hysa"),
                rs.getBigDecimal("opening_balance"),
                rs.getBigDecimal("goal_amount"),
                rs.getBigDecimal("balance"));
    }
}
