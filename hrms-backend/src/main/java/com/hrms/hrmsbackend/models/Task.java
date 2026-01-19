package com.hrms.hrmsbackend.models;

import com.hrms.hrmsbackend.models.enums.TaskPriority;
import com.hrms.hrmsbackend.models.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Long assignedTo;
    private Long assignedBy;

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private TaskPriority priority;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    private Integer progress; // 0-100

    @ElementCollection
    private List<String> tags;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
