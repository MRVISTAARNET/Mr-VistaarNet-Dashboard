package com.hrms.hrmsbackend.models;

import com.hrms.hrmsbackend.models.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attendance")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;

    private LocalDate date;
    private LocalTime checkIn;
    private LocalTime checkOut;
    private Double hoursWorked;

    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;

    private String notes;
}
