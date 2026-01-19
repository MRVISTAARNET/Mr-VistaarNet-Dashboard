package com.hrms.hrmsbackend.services;

import com.hrms.hrmsbackend.dtos.AuthDtos;
import com.hrms.hrmsbackend.dtos.AuthDtos.AuthenticationRequest;
import com.hrms.hrmsbackend.dtos.AuthDtos.AuthenticationResponse;
import com.hrms.hrmsbackend.dtos.AuthDtos.RegisterRequest;
import com.hrms.hrmsbackend.models.User;
import com.hrms.hrmsbackend.models.enums.Role;
import com.hrms.hrmsbackend.models.enums.UserStatus;
import com.hrms.hrmsbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AuthenticationResponse register(RegisterRequest request) {
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Encrypt
                .role(Role.valueOf(request.getRole().toUpperCase()))
                .status(UserStatus.ACTIVE)
                .isVerified(true)
                .isFirstLogin(true)
                .build();

        var savedUser = userRepository.save(user);

        return AuthenticationResponse.builder()
                .token("dummy-token")
                .user(mapToDto(savedUser))
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // We can include a flag in the UserDto to indicate first login
        return AuthenticationResponse.builder()
                .token("dummy-token")
                .user(mapToDto(user))
                .build();
    }

    public void changePassword(Long userId, String newPassword) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFirstLogin(false);
        userRepository.save(user);
    }

    private AuthDtos.UserDto mapToDto(User user) {
        return AuthDtos.UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name().toLowerCase())
                .avatar(user.getAvatar())
                .isFirstLogin(user.isFirstLogin()) // Add this field to DTO
                .build();
    }

    public void forgotPassword(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate Token
        String token = java.util.UUID.randomUUID().toString();
        user.setOtp(token);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(15)); // 15 mins expiry
        userRepository.save(user);

        // LOG TO CONSOLE (Simulated Email)
        System.out.println("\n=======================================================");
        System.out.println("PASSWORD RESET REQUEST");
        System.out.println("Email: " + email);
        System.out.println("Reset Link: http://localhost:5173/reset-password?token=" + token);
        System.out.println("=======================================================\n");
    }

    public void resetPassword(String token, String newPassword) {
        var user = userRepository.findByOtp(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

}
