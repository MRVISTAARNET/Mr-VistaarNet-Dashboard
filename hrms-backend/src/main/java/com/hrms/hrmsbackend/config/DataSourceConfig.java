package com.hrms.hrmsbackend.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        System.out.println("Initializing Custom DataSource...");

        // FIX: Remove channel_binding=require if present, as it causes "SQLState:
        // 99999" crashes
        // on some driver versions in Docker environments.
        String sanitizedUrl = dbUrl;
        if (sanitizedUrl != null && sanitizedUrl.contains("channel_binding=require")) {
            System.out.println("Detected problematic 'channel_binding=require' in URL. Removing it.");
            sanitizedUrl = sanitizedUrl.replace("channel_binding=require", "");
            // Clean up potentially double && or trailing ?
            sanitizedUrl = sanitizedUrl.replace("&&", "&");
            if (sanitizedUrl.endsWith("?")) {
                sanitizedUrl = sanitizedUrl.substring(0, sanitizedUrl.length() - 1);
            }
        }

        System.out.println("Using Sanitized JDBC URL: " + sanitizedUrl);

        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .url(sanitizedUrl)
                .username(dbUser)
                .password(dbPassword)
                .build();
    }
}
