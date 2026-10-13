package com.finance.tracker.income;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcIncomeRepository implements IncomeRepository {

    private static final String SELECT = """
            select id, income_date, source, gross, fed, ss, medicare, state_tax, sdi, note
            from income
            """;

    private final JdbcClient jdbc;

    public JdbcIncomeRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<Income> findAll() {
        return jdbc.sql(SELECT + "order by income_date desc, id desc")
                .query(JdbcIncomeRepository::toIncome)
                .list();
    }

    @Override
    public Optional<Income> findById(Long id) {
        return jdbc.sql(SELECT + "where id = :id")
                .param("id", id)
                .query(JdbcIncomeRepository::toIncome)
                .optional();
    }

    @Override
    public Income save(Income income) {
        Long id = bind("""
                insert into income (income_date, source, gross, fed, ss, medicare, state_tax, sdi, note)
                values (:date, :source, :gross, :fed, :ss, :medicare, :stateTax, :sdi, :note)
                returning id
                """, income)
                .query(Long.class)
                .single();
        return findById(id).orElseThrow();
    }

    @Override
    public Optional<Income> update(Long id, Income income) {
        int rows = bind("""
                update income
                set income_date = :date, source = :source, gross = :gross, fed = :fed, ss = :ss,
                    medicare = :medicare, state_tax = :stateTax, sdi = :sdi, note = :note
                where id = :id
                """, income)
                .param("id", id)
                .update();
        return rows == 0 ? Optional.empty() : findById(id);
    }

    @Override
    public boolean deleteById(Long id) {
        return jdbc.sql("delete from income where id = :id")
                .param("id", id)
                .update() > 0;
    }

    private JdbcClient.StatementSpec bind(String sql, Income income) {
        return jdbc.sql(sql)
                .param("date", income.date())
                .param("source", income.source())
                .param("gross", income.gross())
                .param("fed", income.fed())
                .param("ss", income.ss())
                .param("medicare", income.medicare())
                .param("stateTax", income.stateTax())
                .param("sdi", income.sdi())
                .param("note", income.note(), Types.VARCHAR);
    }

    private static Income toIncome(ResultSet rs, int rowNum) throws SQLException {
        return new Income(
                rs.getLong("id"),
                rs.getObject("income_date", LocalDate.class),
                rs.getString("source"),
                rs.getBigDecimal("gross"),
                rs.getBigDecimal("fed"),
                rs.getBigDecimal("ss"),
                rs.getBigDecimal("medicare"),
                rs.getBigDecimal("state_tax"),
                rs.getBigDecimal("sdi"),
                rs.getString("note"));
    }
}
