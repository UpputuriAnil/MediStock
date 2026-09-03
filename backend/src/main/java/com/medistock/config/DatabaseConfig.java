package com.medistock.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:}")
    private String configuredUrl;

    @Value("${spring.datasource.username:}")
    private String configuredUsername;

    @Value("${spring.datasource.password:}")
    private String configuredPassword;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String configuredDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        String rawUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = System.getenv("DATABASE_URL");
        }
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = configuredUrl;
        }

        String username = System.getenv("SPRING_DATASOURCE_USERNAME");
        if (username == null || username.isBlank()) username = System.getenv("DATABASE_USERNAME");
        if (username == null || username.isBlank()) username = configuredUsername;

        String password = System.getenv("SPRING_DATASOURCE_PASSWORD");
        if (password == null || password.isBlank()) password = System.getenv("DATABASE_PASSWORD");
        if (password == null || password.isBlank()) password = configuredPassword;

        // Fallback: Read .env file if available in working directory or parent
        if (rawUrl == null || rawUrl.isBlank() || rawUrl.contains("localhost:5432")) {
            try {
                java.nio.file.Path envPath = java.nio.file.Paths.get(".env");
                if (!java.nio.file.Files.exists(envPath)) {
                    envPath = java.nio.file.Paths.get("../.env");
                }
                if (java.nio.file.Files.exists(envPath)) {
                    java.util.List<String> lines = java.nio.file.Files.readAllLines(envPath);
                    for (String line : lines) {
                        line = line.trim();
                        if (line.startsWith("SPRING_DATASOURCE_URL=")) {
                            rawUrl = line.substring("SPRING_DATASOURCE_URL=".length()).trim();
                        } else if (line.startsWith("SPRING_DATASOURCE_USERNAME=")) {
                            username = line.substring("SPRING_DATASOURCE_USERNAME=".length()).trim();
                        } else if (line.startsWith("SPRING_DATASOURCE_PASSWORD=")) {
                            password = line.substring("SPRING_DATASOURCE_PASSWORD=".length()).trim();
                        }
                    }
                    log.info("Loaded database configuration from .env file");
                }
            } catch (Exception e) {
                log.debug("Could not parse .env file: {}", e.getMessage());
            }
        }

        HikariConfig config = new HikariConfig();

        if (rawUrl != null && (rawUrl.startsWith("postgresql://") || rawUrl.startsWith("postgres://"))) {
            try {
                URI uri = new URI(rawUrl);
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                String query = uri.getQuery();

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + (query != null && !query.isBlank() ? "?" + query : "");
                config.setJdbcUrl(jdbcUrl);
                config.setDriverClassName("org.postgresql.Driver");

                if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    username = userInfo[0];
                    if (userInfo.length > 1) {
                        password = userInfo[1];
                    }
                }
                log.info("Configured PostgreSQL DataSource for host: {}:{}", host, port);
            } catch (Exception e) {
                log.warn("Failed to parse PostgreSQL URI ({}), falling back to raw JDBC format", e.getMessage());
                String jdbcUrl = rawUrl.startsWith("jdbc:") ? rawUrl : "jdbc:" + rawUrl;
                config.setJdbcUrl(jdbcUrl);
                config.setDriverClassName("org.postgresql.Driver");
            }
        } else {
            String jdbcUrl = (rawUrl != null && !rawUrl.isBlank()) ? rawUrl : "jdbc:postgresql://localhost:5432/medistock";
            if (jdbcUrl.startsWith("postgres") && !jdbcUrl.startsWith("jdbc:")) {
                jdbcUrl = "jdbc:" + jdbcUrl;
            }
            config.setJdbcUrl(jdbcUrl);

            if (jdbcUrl.contains("mysql")) {
                config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            } else if (jdbcUrl.contains("h2")) {
                config.setDriverClassName("org.h2.Driver");
            } else {
                config.setDriverClassName("org.postgresql.Driver");
            }
        }

        if (username != null && !username.isBlank()) {
            config.setUsername(username);
        }
        if (password != null && !password.isBlank()) {
            config.setPassword(password);
        }

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30000);
        config.setConnectionTimeout(30000);
        config.setPoolName("MediStockHikariPool");

        return new HikariDataSource(config);
    }
}
