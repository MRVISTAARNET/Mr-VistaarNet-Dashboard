package com.hrms.hrmsbackend.controllers;

import com.hrms.hrmsbackend.dtos.CoreDtos.AttendanceDto;
import com.hrms.hrmsbackend.services.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<List<AttendanceDto>> getAllAttendance(@RequestParam(required = false) Long employeeId) {
        if (employeeId != null) {
            return ResponseEntity.ok(attendanceService.getAttendanceByEmployee(employeeId));
        }
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @PostMapping("/check-in/{employeeId}")
    public ResponseEntity<?> checkIn(@PathVariable Long employeeId) {
        try {
            return ResponseEntity.ok(attendanceService.checkIn(employeeId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/check-out/{employeeId}")
    public ResponseEntity<Void> checkOut(@PathVariable Long employeeId) {
        attendanceService.checkOut(employeeId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reset")
    public ResponseEntity<Void> resetAttendance() {
        attendanceService.resetAttendance();
        return ResponseEntity.noContent().build();
    }
}
