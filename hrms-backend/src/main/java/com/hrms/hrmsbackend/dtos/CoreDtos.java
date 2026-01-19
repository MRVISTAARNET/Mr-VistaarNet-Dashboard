package com.hrms.hrmsbackend.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class CoreDtos {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DepartmentDto {
        private String id; // Frontend expects string IDs sometimes
        private String name;
        private String code;
        private String manager; // Name of manager
        private Integer employeeCount;
        private Double budget;
        private String description;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PositionDto {
        private String id;
        private String title;
        private String departmentId; // Added ID
        private String department; // Name of department
        private String level;
        private SalaryRange salaryRange;
        private List<String> responsibilities;
        private List<String> requirements;
        private Integer openings;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SalaryRange {
        private Double min;
        private Double max;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmployeeResponseDto {
        private String id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String department;
        private String position;
        private String joiningDate;
        private Double salary;
        private String status;
        private String avatar;
        private String manager;
        private String role;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AttendanceDto {
        private String id;
        private String employeeId;
        private String employeeName;
        private String date;
        private String checkIn;
        private String checkOut;
        private Double hoursWorked;
        private String status;
        private String notes;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LeaveDto {
        private String id;
        private String employeeId;
        private String employeeName;
        private String type;
        private String startDate;
        private String endDate;
        private Double days;
        private String reason;
        private String status;
        private String approvedBy;
        private String createdAt;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TaskDto {
        private String id;
        private String title;
        private String description;
        private String assignedTo; // name
        private String assignedToId; // ID for filtering
        private String assignedBy; // name
        private String dueDate;
        private String priority;
        private String status;
        private Integer progress;
        private String createdAt;
        private List<String> tags;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DocumentDto {
        private String id;
        private String employeeId;
        private String employeeName;
        private String type;
        private String fileName;
        private String uploadDate;
        private String status;
        private String verifiedBy;
        private String verifiedDate;
        private String fileUrl;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MessageDto {
        private String id;
        private String senderId;
        private String senderName;
        private String receiverId;
        private String receiverName;
        private String content;
        private String timestamp;
        private boolean isRead;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class WorkReportDto {
        private String id;
        private String employeeId;
        private String employeeName;
        private String date;
        private String content;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DashboardStats {
        private int totalEmployees;
        private int totalDepartments;
        private int presentToday;
        private int onLeaveToday;
        private int pendingLeaveRequests;
        private int pendingDocuments;
        private int completedTasks;
        private int totalTasks;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmployeeStatsDto {
        private double attendanceRate;
        private double onTimeArrival;
        private double avgWorkHours;
        private int leaveBalance;
        private int pendingTasks;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProfileUpdateDto {
        private String fullName;
        private String avatar; // URL
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AnnouncementDto {
        private String id;
        private String title;
        private String content;
        private String date;
        private String postedBy; // Name of poster
        private String priority;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChartDataDto {
        private String name;
        private int value;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AttendanceTrendDto {
        private String name; // Day (Mon, Tue...)
        private int present;
        private int absent;
        private int late;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ReportsDataDto {
        private List<AttendanceTrendDto> attendanceTrend;
        private List<ChartDataDto> departmentDistribution;
        private List<ChartDataDto> taskStatusDistribution;
    }
}
