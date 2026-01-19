package com.hrms.hrmsbackend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "positions")
public class Position {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Long departmentId;

    private String level;

    private Double salaryMin;
    private Double salaryMax;

    @ElementCollection
    private List<String> responsibilities;

    @ElementCollection
    private List<String> requirements;

    private Integer openings;
}
