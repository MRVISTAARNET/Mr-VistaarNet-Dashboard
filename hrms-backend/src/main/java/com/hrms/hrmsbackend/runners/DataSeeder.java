package com.hrms.hrmsbackend.runners;

import com.hrms.hrmsbackend.models.User;
import com.hrms.hrmsbackend.models.enums.Role;
import com.hrms.hrmsbackend.models.enums.UserStatus;
import com.hrms.hrmsbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Value("${app.master.email}")
    private String masterEmail; // Will use overrides if present, but we will hardcode the specific one in check
    @Value("${app.master.password}")
    private String masterPassword;
    @Value("${app.master.name}")
    private String masterName;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail(masterEmail)) {
            var master = User.builder()
                    .firstName("Master")
                    .lastName("Admin")
                    .email(masterEmail)
                    .password(passwordEncoder.encode(masterPassword)) // Encrypt password
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .isVerified(true)
                    .isFirstLogin(true) // Force password change
                    .build();
            userRepository.save(master);
            log.info("Master account created: {}", masterEmail);
        }
    }
}
