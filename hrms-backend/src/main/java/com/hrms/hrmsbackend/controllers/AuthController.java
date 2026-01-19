package com.hrms.hrmsbackend.controllers;

import com.hrms.hrmsbackend.dtos.AuthDtos.AuthenticationRequest;
import com.hrms.hrmsbackend.dtos.AuthDtos.RegisterRequest;
import com.hrms.hrmsbackend.dtos.AuthDtos.AuthenticationResponse;
import com.hrms.hrmsbackend.services.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(
            @RequestBody AuthenticationRequest request) {
        try {
            return ResponseEntity.ok(service.authenticate(request));
        } catch (RuntimeException e) {
            if (e.getMessage().equals("User not found")) {
                return ResponseEntity.status(404).body(e.getMessage());
            }
            if (e.getMessage().equals("Invalid password")) {
                return ResponseEntity.status(401).body("Invalid credentials");
            }
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody com.hrms.hrmsbackend.dtos.AuthDtos.ChangePasswordRequest request) {
        try {
            service.changePassword(request.getUserId(), request.getNewPassword());
            return ResponseEntity.ok("Password changed successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody com.hrms.hrmsbackend.dtos.AuthDtos.ForgotPasswordRequest request) {
        try {
            service.forgotPassword(request.getEmail());
            // Always return ok to prevent enumeration (even if email not found, though
            // service throws currently)
            // For now, let's catch the exception and ignore/log/return generic if we want
            // strict security,
            // but for this task "User not found" feedback is probably preferred by user.
            return ResponseEntity.ok("Password reset link sent to console.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody com.hrms.hrmsbackend.dtos.AuthDtos.ResetPasswordRequest request) {
        try {
            service.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok("Password reset successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

}
