package com.hrms.hrmsbackend.services;

import com.hrms.hrmsbackend.dtos.CoreDtos.DashboardStats;
import com.hrms.hrmsbackend.models.enums.AttendanceStatus;
import com.hrms.hrmsbackend.models.enums.DocumentStatus;
import com.hrms.hrmsbackend.models.enums.LeaveStatus;
import com.hrms.hrmsbackend.models.enums.TaskStatus;
import com.hrms.hrmsbackend.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class AnalyticsService {

        private final UserRepository userRepository;
        private final DepartmentRepository departmentRepository;
        private final AttendanceRepository attendanceRepository;
        private final LeaveRepository leaveRepository;
        private final DocumentRepository documentRepository;
        private final TaskRepository taskRepository;

        public AnalyticsService(UserRepository userRepository, DepartmentRepository departmentRepository,
                        AttendanceRepository attendanceRepository, LeaveRepository leaveRepository,
                        DocumentRepository documentRepository, TaskRepository taskRepository) {
                this.userRepository = userRepository;
                this.departmentRepository = departmentRepository;
                this.attendanceRepository = attendanceRepository;
                this.leaveRepository = leaveRepository;
                this.documentRepository = documentRepository;
                this.taskRepository = taskRepository;
        }

        // In-memory storage for leave policies (In a real app, this would be in DB)
        private final java.util.Map<String, Integer> leavePolicies = new java.util.HashMap<>();

        {
                leavePolicies.put("Casual Leave (CL)", 12);
                leavePolicies.put("Sick Leave (SL)", 10);
                leavePolicies.put("Earned Leave (EL)", 15);
                leavePolicies.put("Maternity Leave", 180);
                leavePolicies.put("Paternity Leave", 5);
                leavePolicies.put("Compensatory Off", 0);
        }

        public java.util.Map<String, Integer> getLeavePolicies() {
                return leavePolicies;
        }

        public void updateLeavePolicy(String type, int days) {
                leavePolicies.put(type, days);
        }

        public DashboardStats getDashboardStats() {
                return DashboardStats.builder()
                                .totalEmployees((int) userRepository.count())
                                .totalDepartments((int) departmentRepository.count())
                                .presentToday((int) attendanceRepository.findAll().stream()
                                                .filter(a -> a.getDate().equals(
                                                                LocalDate.now(java.time.ZoneId.of("Asia/Kolkata")))
                                                                && a.getStatus() == AttendanceStatus.PRESENT)
                                                .count())
                                .onLeaveToday((int) leaveRepository.findAll().stream()
                                                .filter(l -> l.getStartDate().isBefore(LocalDate.now().plusDays(1))
                                                                && l.getEndDate().isAfter(LocalDate.now().minusDays(1))
                                                                && l.getStatus() == LeaveStatus.APPROVED)
                                                .count())
                                .pendingLeaveRequests((int) leaveRepository.findAll().stream()
                                                .filter(l -> l.getStatus() == LeaveStatus.PENDING)
                                                .count())
                                .pendingDocuments((int) documentRepository.countByStatus(DocumentStatus.PENDING))
                                .completedTasks((int) taskRepository.countByStatus(TaskStatus.COMPLETED))
                                .totalTasks((int) taskRepository.count())
                                .build();
        }

        public com.hrms.hrmsbackend.dtos.CoreDtos.EmployeeStatsDto getEmployeeStats(Long employeeId) {
                // Calculate total leaves allowed based on policies (excluding
                // Maternity/Paternity for general balance if needed, but summing for now)
                // Typically "Leave Balance" refers to usable leaves like CL + SL + EL.
                int totalAllocated = leavePolicies.getOrDefault("Casual Leave (CL)", 0) +
                                leavePolicies.getOrDefault("Sick Leave (SL)", 0) +
                                leavePolicies.getOrDefault("Earned Leave (EL)", 0);

                // Calculate used leaves (Approved)
                int usedLeaves = (int) leaveRepository.findAll().stream()
                                .filter(l -> l.getEmployeeId().equals(employeeId)
                                                && l.getStatus() == LeaveStatus.APPROVED)
                                .mapToLong(l -> java.time.temporal.ChronoUnit.DAYS.between(l.getStartDate(),
                                                l.getEndDate()) + 1)
                                .sum();

                int balance = Math.max(0, totalAllocated - usedLeaves);

                // Calculate Attendance Rate
                long totalRecords = attendanceRepository.findAll().stream()
                                .filter(a -> a.getEmployeeId().equals(employeeId))
                                .count();

                long presentRecords = attendanceRepository.findAll().stream()
                                .filter(a -> a.getEmployeeId().equals(employeeId)
                                                && a.getStatus() == AttendanceStatus.PRESENT)
                                .count();

                double attendanceRate = totalRecords == 0 ? 100.0 : ((double) presentRecords / totalRecords) * 100;

                // Calculate Pending Tasks
                int pendingTasks = (int) taskRepository.findByAssignedTo(employeeId).stream()
                                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                                .count();

                return com.hrms.hrmsbackend.dtos.CoreDtos.EmployeeStatsDto.builder()
                                .attendanceRate(Math.round(attendanceRate * 10.0) / 10.0)
                                .onTimeArrival(90.0) // Placeholder
                                .avgWorkHours(8.5) // Placeholder
                                .leaveBalance(balance)
                                .pendingTasks(pendingTasks)
                                .build();
        }

        public com.hrms.hrmsbackend.dtos.CoreDtos.ReportsDataDto getReportsData() {
                // 1. Attendance Trend (Last 5 days)
                java.util.List<com.hrms.hrmsbackend.dtos.CoreDtos.AttendanceTrendDto> attendanceTrend = new java.util.ArrayList<>();
                LocalDate today = LocalDate.now();
                for (int i = 4; i >= 0; i--) {
                        LocalDate date = today.minusDays(i);
                        String dayName = date.getDayOfWeek().name().substring(0, 3); // Mon, Tue...

                        long present = attendanceRepository.findAll().stream()
                                        .filter(a -> a.getDate().equals(date)
                                                        && a.getStatus() == AttendanceStatus.PRESENT)
                                        .count();
                        long late = attendanceRepository.findAll().stream()
                                        .filter(a -> a.getDate().equals(date) && a.getStatus() == AttendanceStatus.LATE)
                                        .count();
                        long totalEmps = userRepository.count();
                        // Simplified absent calculation: Total - (Present + Late)
                        long absent = Math.max(0, totalEmps - (present + late));

                        attendanceTrend.add(com.hrms.hrmsbackend.dtos.CoreDtos.AttendanceTrendDto.builder()
                                        .name(dayName)
                                        .present((int) present)
                                        .late((int) late)
                                        .absent((int) absent)
                                        .build());
                }

                // 2. Department Distribution
                java.util.List<com.hrms.hrmsbackend.dtos.CoreDtos.ChartDataDto> departmentDistribution = departmentRepository
                                .findAll().stream()
                                .map(dept -> com.hrms.hrmsbackend.dtos.CoreDtos.ChartDataDto.builder()
                                                .name(dept.getName())
                                                .value((int) userRepository.findAll().stream()
                                                                .filter(u -> u.getDepartmentId() != null
                                                                                && u.getDepartmentId()
                                                                                                .equals(dept.getId()))
                                                                .count())
                                                .build())
                                .collect(java.util.stream.Collectors.toList());

                // 3. Task Status Distribution
                java.util.List<com.hrms.hrmsbackend.dtos.CoreDtos.ChartDataDto> taskStatusDistribution = java.util.Arrays
                                .stream(TaskStatus.values())
                                .map(status -> com.hrms.hrmsbackend.dtos.CoreDtos.ChartDataDto.builder()
                                                .name(status.name()) // COMPLETED, TODO...
                                                // Frontend expects "Completed", "In Progress" etc. Mapping required or
                                                // frontend
                                                // adapts.
                                                // Let's format nicely.
                                                .value((int) taskRepository.countByStatus(status))
                                                .build())
                                .collect(java.util.stream.Collectors.toList());

                // Manual formatting for Task Status names if needed, or handle on frontend.
                // Let's capitalize nicely.
                taskStatusDistribution.forEach(d -> {
                        String name = d.getName();
                        d.setName(name.charAt(0) + name.substring(1).toLowerCase().replace("_", " "));
                });

                return com.hrms.hrmsbackend.dtos.CoreDtos.ReportsDataDto.builder()
                                .attendanceTrend(attendanceTrend)
                                .departmentDistribution(departmentDistribution)
                                .taskStatusDistribution(taskStatusDistribution)
                                .build();
        }
}
