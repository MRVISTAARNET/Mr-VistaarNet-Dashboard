package com.hrms.hrmsbackend.controllers;

import com.hrms.hrmsbackend.dtos.CoreDtos.DashboardStats;
import com.hrms.hrmsbackend.dtos.CoreDtos.EmployeeStatsDto;
import com.hrms.hrmsbackend.services.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/reports")
    public ResponseEntity<com.hrms.hrmsbackend.dtos.CoreDtos.ReportsDataDto> getReportsData() {
        return ResponseEntity.ok(analyticsService.getReportsData());
    }

    @GetMapping("/employee/{id}")
    public ResponseEntity<EmployeeStatsDto> getEmployeeStats(@PathVariable Long id) {
        return ResponseEntity.ok(analyticsService.getEmployeeStats(id));
    }

    @GetMapping("/policies")
    public ResponseEntity<java.util.Map<String, Integer>> getLeavePolicies() {
        return ResponseEntity.ok(analyticsService.getLeavePolicies());
    }

    @org.springframework.web.bind.annotation.PostMapping("/policies")
    public ResponseEntity<Void> updateLeavePolicy(
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> payload) {
        String type = (String) payload.get("type");
        Integer days = (Integer) payload.get("days");
        if (type != null && days != null) {
            analyticsService.updateLeavePolicy(type, days);
        }
        return ResponseEntity.ok().build();
    }
}
