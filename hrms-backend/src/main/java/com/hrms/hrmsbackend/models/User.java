package com.hrms.hrmsbackend.models;

import com.hrms.hrmsbackend.models.enums.Role;
import com.hrms.hrmsbackend.models.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    private Long departmentId;
    private Long positionId;
    private String phone;
    private LocalDate joiningDate;
    private Double salary;
    private Long managerId;

    private String otp;
    private LocalDateTime otpExpiry;

    @Builder.Default
    private boolean isVerified = false;

    @Builder.Default
    private boolean isFirstLogin = true;

    private String avatar; // URL to avatar
}
