package com.hrms.hrmsbackend.services;

import com.hrms.hrmsbackend.dtos.CoreDtos.LeaveDto;
import com.hrms.hrmsbackend.models.LeaveRequest;
import com.hrms.hrmsbackend.models.enums.LeaveStatus;
import com.hrms.hrmsbackend.models.enums.LeaveType;
import com.hrms.hrmsbackend.repositories.LeaveRepository;
import com.hrms.hrmsbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;

    public List<LeaveDto> getAllLeaves() {
        return leaveRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<LeaveDto> getLeavesByEmployee(Long employeeId) {
        return leaveRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public LeaveDto createLeaveRequest(LeaveDto dto) {
        LeaveRequest req = LeaveRequest.builder()
                .employeeId(Long.parseLong(dto.getEmployeeId()))
                .type(LeaveType.valueOf(dto.getType().toUpperCase()))
                .startDate(LocalDate.parse(dto.getStartDate()))
                .endDate(LocalDate.parse(dto.getEndDate()))
                .days(dto.getDays())
                .reason(dto.getReason())
                .status(LeaveStatus.PENDING)
                .build();
        return mapToDto(leaveRepository.save(req));
    }

    public LeaveDto updateStatus(Long id, String status, Long approverId) {
        LeaveRequest req = leaveRepository.findById(id).orElseThrow();
        req.setStatus(LeaveStatus.valueOf(status.toUpperCase()));
        if (approverId != null)
            req.setApprovedBy(approverId);
        return mapToDto(leaveRepository.save(req));
    }

    private LeaveDto mapToDto(LeaveRequest req) {
        String empName = userRepository.findById(req.getEmployeeId())
                .map(u -> u.getFirstName() + " " + u.getLastName())
                .orElse("Unknown");

        String approvedByName = null;
        if (req.getApprovedBy() != null) {
            approvedByName = userRepository.findById(req.getApprovedBy())
                    .map(u -> u.getFirstName() + " " + u.getLastName())
                    .orElse("Unknown");
        }

        return LeaveDto.builder()
                .id(req.getId().toString())
                .employeeId(req.getEmployeeId().toString())
                .employeeName(empName)
                .type(req.getType().name().toLowerCase())
                .startDate(req.getStartDate().toString())
                .endDate(req.getEndDate().toString())
                .days(req.getDays())
                .reason(req.getReason())
                .status(req.getStatus().name().toLowerCase())
                .approvedBy(approvedByName)
                .createdAt(req.getCreatedAt().toString())
                .build();
    }
}
