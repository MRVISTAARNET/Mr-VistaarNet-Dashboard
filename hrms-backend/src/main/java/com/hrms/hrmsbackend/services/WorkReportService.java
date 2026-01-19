package com.hrms.hrmsbackend.services;

import com.hrms.hrmsbackend.dtos.CoreDtos.WorkReportDto;
import com.hrms.hrmsbackend.models.User;
import com.hrms.hrmsbackend.models.WorkReport;
import com.hrms.hrmsbackend.repositories.UserRepository;
import com.hrms.hrmsbackend.repositories.WorkReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkReportService {

    private final WorkReportRepository workReportRepository;
    private final UserRepository userRepository;

    public List<WorkReportDto> getAllReports() {
        return workReportRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<WorkReportDto> getReportsByEmployeeId(Long employeeId) {
        return workReportRepository.findAll().stream()
                .filter(report -> report.getEmployeeId().equals(employeeId))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public WorkReportDto createReport(WorkReportDto dto) {
        WorkReport report = WorkReport.builder()
                .employeeId(Long.parseLong(dto.getEmployeeId()))
                .date(dto.getDate() != null ? LocalDate.parse(dto.getDate()) : LocalDate.now())
                .content(dto.getContent())
                .build();
        return mapToDto(workReportRepository.save(report));
    }

    public WorkReportDto updateReport(Long id, WorkReportDto dto) {
        WorkReport report = workReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (dto.getContent() != null)
            report.setContent(dto.getContent());
        if (dto.getDate() != null)
            report.setDate(LocalDate.parse(dto.getDate()));

        return mapToDto(workReportRepository.save(report));
    }

    public void deleteReport(Long id) {
        workReportRepository.deleteById(id);
    }

    private WorkReportDto mapToDto(WorkReport report) {
        User user = userRepository.findById(report.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("User not found for employeeId: " + report.getEmployeeId()));

        return WorkReportDto.builder()
                .id(report.getId().toString())
                .employeeId(report.getEmployeeId().toString())
                .employeeName(user.getFirstName() + " " + user.getLastName())
                .date(report.getDate().toString())
                .content(report.getContent())
                .build();
    }
}
