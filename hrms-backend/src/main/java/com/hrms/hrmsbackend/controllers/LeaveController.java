package com.hrms.hrmsbackend.controllers;

import com.hrms.hrmsbackend.dtos.CoreDtos.LeaveDto;
import com.hrms.hrmsbackend.services.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping
    public ResponseEntity<List<LeaveDto>> getAllLeaves(@RequestParam(required = false) Long employeeId) {
        if (employeeId != null) {
            return ResponseEntity.ok(leaveService.getLeavesByEmployee(employeeId));
        }
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @PostMapping
    public ResponseEntity<LeaveDto> createLeaveRequest(@RequestBody LeaveDto dto) {
        return ResponseEntity.ok(leaveService.createLeaveRequest(dto));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<LeaveDto> approveLeave(@PathVariable Long id, @RequestParam Long approvedBy) {
        return ResponseEntity.ok(leaveService.updateStatus(id, "APPROVED", approvedBy));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<LeaveDto> rejectLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.updateStatus(id, "REJECTED", null));
    }
}
