package com.finance.tracker.budgets;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class JdbcBudgetRepository implements BudgetRepository {

    private final JdbcClient jdbc;

    public JdbcBudgetRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<MonthBudget> findAll() {
        Map<String, Map<String, BigDecimal>> lines = new LinkedHashMap<>();
        jdbc.sql("select month, category, amount from budget_lines order by month, category")
                .query((rs, rowNum) -> {
                    lines.computeIfAbsent(rs.getString("month"), k -> new LinkedHashMap<>())
                            .put(rs.getString("category"), rs.getBigDecimal("amount"));
                    return null;
                })
                .list();
        return jdbc.sql("select month, expected_income from monthly_plans order by month")
                .query((rs, rowNum) -> {
                    String month = rs.getString("month");
                    return new MonthBudget(month, rs.getBigDecimal("expected_income"),
                            lines.getOrDefault(month, Map.of()));
                })
                .list();
    }

    @Override
    @Transactional
    public MonthBudget save(MonthBudget budget) {
        jdbc.sql("""
                insert into monthly_plans (month, expected_income)
                values (:month, :income)
                on conflict (month) do update set expected_income = excluded.expected_income
                """)
                .param("month", budget.month())
                .param("income", budget.expectedIncome())
                .update();
        jdbc.sql("delete from budget_lines where month = :month")
                .param("month", budget.month())
                .update();
        for (Map.Entry<String, BigDecimal> line : budget.categories().entrySet()) {
            jdbc.sql("insert into budget_lines (month, category, amount) values (:month, :category, :amount)")
                    .param("month", budget.month())
                    .param("category", line.getKey())
                    .param("amount", line.getValue())
                    .update();
        }
        return new MonthBudget(budget.month(), budget.expectedIncome(), budget.categories());
    }
}
