package com.hrms.hrmsbackend.controllers;

import com.hrms.hrmsbackend.dtos.CoreDtos.DocumentDto;
import com.hrms.hrmsbackend.services.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<List<DocumentDto>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/employee/{id}")
    public ResponseEntity<List<DocumentDto>> getDocumentsByEmployeeId(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentsByEmployeeId(id));
    }

    @PostMapping("/upload")
    public ResponseEntity<DocumentDto> uploadDocument(@RequestBody DocumentDto dto) {
        return ResponseEntity.ok(documentService.uploadDocument(dto));
    }

    @PostMapping(value = "/upload-file", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDto> uploadFile(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("employeeId") String employeeIdStr,
            @RequestParam("type") String type,
            @RequestParam(value = "isGlobal", required = false) Boolean isGlobal) {
        try {
            Long employeeId = Long.parseLong(employeeIdStr);
            return ResponseEntity.ok(documentService.uploadFile(file, employeeId, type, isGlobal));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<DocumentDto> verifyDocument(@PathVariable Long id, @RequestParam Long verifierId) {
        return ResponseEntity.ok(documentService.verifyDocument(id, verifierId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
