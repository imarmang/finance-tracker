package com.finance.tracker.expenses;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.finance.tracker.expenses.Expense.Category;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcExpenseRepository implements ExpenseRepository {

    private static final String SELECT = """
            select id, expense_date, vendor, category, amount, card, mult, note
            from expenses
            """;

    private final JdbcClient jdbc;

    public JdbcExpenseRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<Expense> findAll() {
        return jdbc.sql(SELECT + "order by expense_date desc, id desc")
                .query(JdbcExpenseRepository::toExpense)
                .list();
    }

    @Override
    public Optional<Expense> findById(Long id) {
        return jdbc.sql(SELECT + "where id = :id")
                .param("id", id)
                .query(JdbcExpenseRepository::toExpense)
                .optional();
    }

    @Override
    public Expense save(Expense expense) {
        Long id = bind("""
                insert into expenses (expense_date, vendor, category, amount, card, mult, note)
                values (:date, :vendor, :category, :amount, :card, :mult, :note)
                returning id
                """, expense)
                .query(Long.class)
                .single();
        return findById(id).orElseThrow();
    }

    @Override
    public Optional<Expense> update(Long id, Expense expense) {
        int rows = bind("""
                update expenses
                set expense_date = :date, vendor = :vendor, category = :category,
                    amount = :amount, card = :card, mult = :mult, note = :note
                where id = :id
                """, expense)
                .param("id", id)
                .update();
        return rows == 0 ? Optional.empty() : findById(id);
    }

    @Override
    public boolean deleteById(Long id) {
        return jdbc.sql("delete from expenses where id = :id")
                .param("id", id)
                .update() > 0;
    }

    @Override
    public boolean existsByCard(String card) {
        return jdbc.sql("select exists (select 1 from expenses where card = :card)")
                .param("card", card)
                .query(Boolean.class)
                .single();
    }

    private JdbcClient.StatementSpec bind(String sql, Expense expense) {
        return jdbc.sql(sql)
                .param("date", expense.date())
                .param("vendor", expense.vendor())
                .param("category", expense.category().name())
                .param("amount", expense.amount())
                .param("card", expense.card())
                .param("mult", expense.mult())
                .param("note", expense.note(), Types.VARCHAR);
    }

    private static Expense toExpense(ResultSet rs, int rowNum) throws SQLException {
        return new Expense(
                rs.getLong("id"),
                rs.getObject("expense_date", LocalDate.class),
                rs.getString("vendor"),
                Category.valueOf(rs.getString("category")),
                rs.getBigDecimal("amount"),
                rs.getString("card"),
                rs.getBigDecimal("mult"),
                rs.getString("note"));
    }
}
