package com.hrms.hrmsbackend.models;

import com.hrms.hrmsbackend.models.enums.DocumentStatus;
import com.hrms.hrmsbackend.models.enums.DocumentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;

    @Enumerated(EnumType.STRING)
    private DocumentType type;

    private String fileName;

    // In production, use S3 or similar. Here we might store file path or base64
    // (not recommended for large files)
    // Storing path assuming local storage
    private String fileUrl;

    private LocalDate uploadDate;

    @Enumerated(EnumType.STRING)
    private DocumentStatus status;

    private Long verifiedBy;
    private LocalDate verifiedDate;

    @Column(name = "is_global")
    private Boolean isGlobal;
}
