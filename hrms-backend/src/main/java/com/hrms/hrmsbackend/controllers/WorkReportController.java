package com.hrms.hrmsbackend.controllers;

import com.hrms.hrmsbackend.dtos.CoreDtos.WorkReportDto;
import com.hrms.hrmsbackend.services.WorkReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-reports")
@RequiredArgsConstructor
public class WorkReportController {

    private final WorkReportService workReportService;

    @GetMapping
    public ResponseEntity<List<WorkReportDto>> getAllReports() {
        return ResponseEntity.ok(workReportService.getAllReports());
    }

    @GetMapping("/employee/{id}")
    public ResponseEntity<List<WorkReportDto>> getReportsByEmployeeId(@PathVariable Long id) {
        return ResponseEntity.ok(workReportService.getReportsByEmployeeId(id));
    }

    @PostMapping
    public ResponseEntity<WorkReportDto> createReport(@RequestBody WorkReportDto dto) {
        return ResponseEntity.ok(workReportService.createReport(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkReportDto> updateReport(@PathVariable Long id, @RequestBody WorkReportDto dto) {
        return ResponseEntity.ok(workReportService.updateReport(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        workReportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
}
