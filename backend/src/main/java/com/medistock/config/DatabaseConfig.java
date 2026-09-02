package com.medistock.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url:}")
    private String envUrl;

    @Value("${spring.datasource.username:}")
    private String envUsername;

    @Value("${spring.datasource.password:}")
    private String envPassword;

    @Value("${spring.datasource.driver-class-name:}")
    private String envDriverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        String dbUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = System.getenv("DATABASE_URL");
        }
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = envUrl;
        }

        HikariConfig config = new HikariConfig();

        if (dbUrl != null && (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://"))) {
            try {
                URI uri = new URI(dbUrl);
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                config.setJdbcUrl(jdbcUrl);
                config.setDriverClassName("org.postgresql.Driver");

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":");
                    config.setUsername(userInfo[0]);
                    if (userInfo.length > 1) {
                        config.setPassword(userInfo[1]);
                    }
                } else {
                    if (envUsername != null && !envUsername.isBlank()) config.setUsername(envUsername);
                    if (envPassword != null && !envPassword.isBlank()) config.setPassword(envPassword);
                }
            } catch (URISyntaxException e) {
                String formattedUrl = dbUrl.startsWith("jdbc:") ? dbUrl : "jdbc:" + dbUrl;
                config.setJdbcUrl(formattedUrl);
                config.setDriverClassName("org.postgresql.Driver");
                if (envUsername != null && !envUsername.isBlank()) config.setUsername(envUsername);
                if (envPassword != null && !envPassword.isBlank()) config.setPassword(envPassword);
            }
        } else {
            String finalUrl = (dbUrl != null && !dbUrl.isBlank()) ? dbUrl : "jdbc:mysql://localhost:3306/medistock?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true";
            if (dbUrl != null && dbUrl.startsWith("postgres") && !dbUrl.startsWith("jdbc:")) {
                finalUrl = "jdbc:" + dbUrl;
            }
            config.setJdbcUrl(finalUrl);

            if (envDriverClassName != null && !envDriverClassName.isBlank()) {
                config.setDriverClassName(envDriverClassName);
            } else if (finalUrl.contains("postgresql")) {
                config.setDriverClassName("org.postgresql.Driver");
            } else if (finalUrl.contains("mysql")) {
                config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            } else if (finalUrl.contains("h2")) {
                config.setDriverClassName("org.h2.Driver");
            }

            String user = System.getenv("SPRING_DATASOURCE_USERNAME");
            if (user == null || user.isBlank()) user = envUsername;
            String pass = System.getenv("SPRING_DATASOURCE_PASSWORD");
            if (pass == null || pass.isBlank()) pass = envPassword;

            if (user != null && !user.isBlank()) config.setUsername(user);
            if (pass != null && !pass.isBlank()) config.setPassword(pass);
        }

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30000);
        config.setConnectionTimeout(30000);
        config.setPoolName("MediStockHikariPool");

        return new HikariDataSource(config);
    }
}
