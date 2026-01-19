package com.hrms.hrmsbackend.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "announcements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String content; // or detailed text
    private LocalDate date;
    private Long postedBy; // User ID
    private String priority; // 'Low', 'Medium', 'High'
}
