package com.hrms.hrmsbackend.controllers;

import com.hrms.hrmsbackend.repositories.UserRepository;
import com.hrms.hrmsbackend.repositories.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final com.hrms.hrmsbackend.repositories.DepartmentRepository departmentRepository;

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getDebugInfo() {
        Map<String, Object> info = new HashMap<>();
        ZoneId zone = ZoneId.of("Asia/Kolkata");

        info.put("serverTime_UTC", LocalDateTime.now(ZoneId.of("UTC")).toString());
        info.put("serverTime_Kolkata", LocalDateTime.now(zone).toString());
        info.put("today_Kolkata", LocalDate.now(zone).toString());

        info.put("totalUsers", userRepository.count());
        info.put("totalAttendanceRecords", attendanceRepository.count());

        long presentToday = attendanceRepository.findAll().stream()
                .filter(a -> a.getDate().equals(LocalDate.now(zone))
                        && a.getStatus() == com.hrms.hrmsbackend.models.enums.AttendanceStatus.PRESENT)
                .count();
        info.put("presentToday_Calculated", presentToday);

        // Show file upload path
        info.put("uploadDir", java.nio.file.Paths.get("uploads/avatars/").toAbsolutePath().toString());

        // Check a sample user department
        userRepository.findAll().stream().findFirst().ifPresent(u -> {
            info.put("sampleUser_Id", u.getId());
            info.put("sampleUser_Name", u.getFirstName());
            info.put("sampleUser_DeptId", u.getDepartmentId());
            if (u.getDepartmentId() != null) {
                departmentRepository.findById(u.getDepartmentId())
                        .ifPresent(d -> info.put("sampleUser_DeptName", d.getName()));
            }
        });

        return ResponseEntity.ok(info);
    }
}
