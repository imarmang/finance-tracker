package com.finance.tracker.paymentmethods;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class JdbcPaymentMethodRepository implements PaymentMethodRepository {

    private static final String SELECT = """
            select id, name, kind, default_mult
            from payment_methods
            """;

    private final JdbcClient jdbc;

    public JdbcPaymentMethodRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<PaymentMethod> findAll() {
        List<PaymentMethod> methods = jdbc.sql(SELECT + "order by id")
                .query(JdbcPaymentMethodRepository::toMethod)
                .list();
        Map<Long, Map<String, BigDecimal>> rules = rulesByMethod();
        return methods.stream()
                .map(m -> new PaymentMethod(m.id(), m.name(), m.kind(), m.defaultMult(),
                        rules.getOrDefault(m.id(), Map.of())))
                .toList();
    }

    @Override
    public Optional<PaymentMethod> findById(Long id) {
        return jdbc.sql(SELECT + "where id = :id")
                .param("id", id)
                .query(JdbcPaymentMethodRepository::toMethod)
                .optional()
                .map(m -> new PaymentMethod(m.id(), m.name(), m.kind(), m.defaultMult(), rulesOf(m.id())));
    }

    @Override
    @Transactional
    public PaymentMethod save(PaymentMethod method) {
        Long id = jdbc.sql("""
                insert into payment_methods (name, kind, default_mult)
                values (:name, :kind, :defaultMult)
                returning id
                """)
                .param("name", method.name())
                .param("kind", method.kind().name())
                .param("defaultMult", method.defaultMult())
                .query(Long.class)
                .single();
        insertRules(id, method.rules());
        return findById(id).orElseThrow();
    }

    @Override
    @Transactional
    public Optional<PaymentMethod> update(Long id, PaymentMethod method) {
        int rows = jdbc.sql("""
                update payment_methods
                set name = :name, kind = :kind, default_mult = :defaultMult
                where id = :id
                """)
                .param("id", id)
                .param("name", method.name())
                .param("kind", method.kind().name())
                .param("defaultMult", method.defaultMult())
                .update();
        if (rows == 0) {
            return Optional.empty();
        }
        jdbc.sql("delete from payment_method_rules where payment_method_id = :id")
                .param("id", id)
                .update();
        insertRules(id, method.rules());
        return findById(id);
    }

    @Override
    public boolean deleteById(Long id) {
        return jdbc.sql("delete from payment_methods where id = :id")
                .param("id", id)
                .update() > 0;
    }

    private void insertRules(Long methodId, Map<String, BigDecimal> rules) {
        for (Map.Entry<String, BigDecimal> rule : rules.entrySet()) {
            jdbc.sql("""
                    insert into payment_method_rules (payment_method_id, category, mult)
                    values (:id, :category, :mult)
                    """)
                    .param("id", methodId)
                    .param("category", rule.getKey())
                    .param("mult", rule.getValue())
                    .update();
        }
    }

    private Map<String, BigDecimal> rulesOf(Long methodId) {
        return jdbc.sql("""
                select category, mult from payment_method_rules
                where payment_method_id = :id
                order by category
                """)
                .param("id", methodId)
                .query((rs, rowNum) -> Map.entry(rs.getString("category"), rs.getBigDecimal("mult")))
                .list()
                .stream()
                .collect(LinkedHashMap::new, (map, e) -> map.put(e.getKey(), e.getValue()), Map::putAll);
    }

    private Map<Long, Map<String, BigDecimal>> rulesByMethod() {
        Map<Long, Map<String, BigDecimal>> byMethod = new LinkedHashMap<>();
        jdbc.sql("""
                select payment_method_id, category, mult from payment_method_rules
                order by payment_method_id, category
                """)
                .query((rs, rowNum) -> {
                    byMethod.computeIfAbsent(rs.getLong("payment_method_id"), k -> new LinkedHashMap<>())
                            .put(rs.getString("category"), rs.getBigDecimal("mult"));
                    return null;
                })
                .list();
        return byMethod;
    }

    /** Maps a row to a method without rules. The rules are added by the caller. */
    private static PaymentMethod toMethod(ResultSet rs, int rowNum) throws SQLException {
        return new PaymentMethod(
                rs.getLong("id"),
                rs.getString("name"),
                PaymentMethod.Kind.valueOf(rs.getString("kind")),
                rs.getBigDecimal("default_mult"),
                Map.of());
    }
}
