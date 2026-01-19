package com.hrms.hrmsbackend.repositories;

import com.hrms.hrmsbackend.models.Document;
import com.hrms.hrmsbackend.models.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByEmployeeId(Long employeeId);

    long countByStatus(DocumentStatus status);
}
