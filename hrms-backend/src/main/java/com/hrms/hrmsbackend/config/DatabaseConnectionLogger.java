package com.hrms.hrmsbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConnectionLogger implements CommandLineRunner {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("==========================================");
        System.out.println("STARTUP DEBUG: DATABASE CONNECTION INFO");
        System.out.println("==========================================");
        System.out.println("Effective JDBC URL: " + dbUrl);
        System.out.println("Effective DB User: " + dbUser);
        // Do not print password
        System.out.println("==========================================");
    }
}
