package com.finance.tracker;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class DatabaseConnectionTest {

	@Autowired
	private JdbcTemplate jdbc;

	@Test
	void canQueryPostgres() {
		Integer result = jdbc.queryForObject("select 1", Integer.class);
		assertEquals(1, result);
	}

}
