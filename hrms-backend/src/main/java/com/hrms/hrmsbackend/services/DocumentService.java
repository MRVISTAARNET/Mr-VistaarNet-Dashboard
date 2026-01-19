package com.hrms.hrmsbackend.services;

import com.hrms.hrmsbackend.dtos.CoreDtos.DocumentDto;
import com.hrms.hrmsbackend.models.Document;
import com.hrms.hrmsbackend.models.enums.DocumentStatus;
import com.hrms.hrmsbackend.models.enums.DocumentType;
import com.hrms.hrmsbackend.repositories.DocumentRepository;
import com.hrms.hrmsbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    public List<DocumentDto> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<DocumentDto> getDocumentsByEmployeeId(Long employeeId) {
        return documentRepository.findAll().stream()
                .filter(doc -> doc.getEmployeeId().equals(employeeId))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DocumentDto uploadDocument(DocumentDto dto) {
        // Fallback or manual entry
        Document doc = Document.builder()
                .employeeId(Long.parseLong(dto.getEmployeeId()))
                .type(DocumentType.valueOf(dto.getType().toUpperCase()))
                .fileName(dto.getFileName())
                .fileUrl(dto.getFileUrl() != null ? dto.getFileUrl() : "#")
                .uploadDate(LocalDate.now())
                .status(DocumentStatus.PENDING)
                .build();
        return mapToDto(documentRepository.save(doc));
    }

    public DocumentDto uploadFile(org.springframework.web.multipart.MultipartFile file, Long employeeId, String type) {
        try {
            String uploadDir = "uploads/documents/";
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            String fileName = java.util.UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            java.nio.file.Path filePath = uploadPath.resolve(fileName);
            java.nio.file.Files.copy(file.getInputStream(), filePath,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "http://localhost:8080/uploads/documents/" + fileName;

            Document doc = Document.builder()
                    .employeeId(employeeId)
                    .type(DocumentType.valueOf(type.toUpperCase()))
                    .fileName(file.getOriginalFilename())
                    .fileUrl(fileUrl)
                    .uploadDate(LocalDate.now())
                    .status(DocumentStatus.PENDING)
                    .build();

            return mapToDto(documentRepository.save(doc));

        } catch (java.io.IOException e) {
            throw new RuntimeException("Could not upload document", e);
        }
    }

    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
    }

    public DocumentDto verifyDocument(Long id, Long verifierId) {
        Document doc = documentRepository.findById(id).orElseThrow();
        doc.setStatus(DocumentStatus.VERIFIED);
        doc.setVerifiedBy(verifierId);
        doc.setVerifiedDate(LocalDate.now());
        return mapToDto(documentRepository.save(doc));
    }

    private DocumentDto mapToDto(Document doc) {
        String empName = userRepository.findById(doc.getEmployeeId())
                .map(u -> u.getFirstName() + " " + u.getLastName())
                .orElse("Unknown");

        String verifierName = null;
        if (doc.getVerifiedBy() != null) {
            verifierName = userRepository.findById(doc.getVerifiedBy())
                    .map(u -> u.getFirstName() + " " + u.getLastName())
                    .orElse("Unknown");
        }

        return DocumentDto.builder()
                .id(doc.getId().toString())
                .employeeId(doc.getEmployeeId().toString())
                .employeeName(empName)
                .type(doc.getType().name().toLowerCase())
                .fileName(doc.getFileName())
                .uploadDate(doc.getUploadDate().toString())
                .status(doc.getStatus().name().toLowerCase())
                .verifiedBy(verifierName)
                .verifiedDate(doc.getVerifiedDate() != null ? doc.getVerifiedDate().toString() : null)
                .fileUrl(doc.getFileUrl())
                .build();
    }
}
