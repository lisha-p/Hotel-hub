package com.hotelhub.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
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

    @Bean
    @Primary
    public DataSource dataSource() {
        String dbUrl = System.getenv("DB_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = System.getenv("DATABASE_URL");
        }
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = configuredUrl;
        }

        if (dbUrl != null && !dbUrl.isBlank()) {
            String rawUrl = dbUrl.trim();

            // Handle Render / Cloud PostgreSQL URLs in any format (postgres://, postgresql://, or jdbc:postgresql://)
            if (rawUrl.contains("postgres")) {
                try {
                    String cleanUrl = rawUrl.replaceFirst("^jdbc:", "");
                    String parseable = cleanUrl.replaceFirst("^postgres(ql)?://", "http://");
                    URI uri = URI.create(parseable);
                    
                    String host = uri.getHost();
                    int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                    String path = uri.getPath();
                    
                    String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                    String username = configuredUsername;
                    String password = configuredPassword;

                    if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                        String[] parts = uri.getUserInfo().split(":", 2);
                        username = parts[0];
                        if (parts.length > 1) {
                            password = parts[1];
                        }
                    }

                    log.info("Successfully parsed PostgreSQL URL. Clean JDBC URL: {} for user: {}", jdbcUrl, username);
                    return DataSourceBuilder.create()
                            .driverClassName("org.postgresql.Driver")
                            .url(jdbcUrl)
                            .username(username)
                            .password(password)
                            .build();
                } catch (Exception e) {
                    log.error("Failed to parse PostgreSQL URI: {}", e.getMessage());
                }
            } else if (rawUrl.startsWith("jdbc:mysql:")) {
                log.info("Using MySQL JDBC URL");
                return DataSourceBuilder.create()
                        .driverClassName("com.mysql.cj.jdbc.Driver")
                        .url(rawUrl)
                        .username(configuredUsername)
                        .password(configuredPassword)
                        .build();
            }
        }

        // Default fallback to configured properties
        return DataSourceBuilder.create()
                .driverClassName("org.postgresql.Driver")
                .url(configuredUrl.isEmpty() ? "jdbc:postgresql://localhost:5432/hotelhub_db" : configuredUrl)
                .username(configuredUsername)
                .password(configuredPassword)
                .build();
    }
}
