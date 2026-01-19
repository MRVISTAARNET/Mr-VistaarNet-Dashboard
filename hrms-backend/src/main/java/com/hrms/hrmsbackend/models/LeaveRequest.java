package com.hrms.hrmsbackend.models;

import com.hrms.hrmsbackend.models.enums.LeaveStatus;
import com.hrms.hrmsbackend.models.enums.LeaveType;
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
@Table(name = "leave_requests")
public class LeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;

    @Enumerated(EnumType.STRING)
    private LeaveType type;

    private LocalDate startDate;
    private LocalDate endDate;
    private Double days;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    private LeaveStatus status;

    private Long approvedBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

}
