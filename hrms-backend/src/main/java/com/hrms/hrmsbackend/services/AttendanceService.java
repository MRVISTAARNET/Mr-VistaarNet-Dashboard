package com.hrms.hrmsbackend.services;

import com.hrms.hrmsbackend.dtos.CoreDtos.AttendanceDto;
import com.hrms.hrmsbackend.models.Attendance;
import com.hrms.hrmsbackend.models.enums.AttendanceStatus;
import com.hrms.hrmsbackend.repositories.AttendanceRepository;
import com.hrms.hrmsbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final ZoneId zoneId = ZoneId.of("Asia/Kolkata");

    public List<AttendanceDto> getAllAttendance() {
        return attendanceRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getAttendanceByEmployee(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AttendanceDto checkIn(Long employeeId) {
        LocalDate today = LocalDate.now(zoneId);
        if (attendanceRepository.findByEmployeeIdAndDate(employeeId, today).isPresent()) {
            throw new RuntimeException("Already clocked in today");
        }

        LocalTime now = LocalTime.now(zoneId);

        // Enforce 9:00 AM rule
        if (now.isBefore(LocalTime.of(9, 0))) {
            throw new RuntimeException("Check-in is only allowed after 9:00 AM");
        }

        AttendanceStatus status = now.isAfter(LocalTime.of(10, 0)) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

        Attendance attendance = Attendance.builder()
                .employeeId(employeeId)
                .date(today)
                .checkIn(now)
                .status(status)
                .build();
        return mapToDto(attendanceRepository.save(attendance));
    }

    public AttendanceDto checkOut(Long employeeId) {
        LocalDate today = LocalDate.now(zoneId);

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new RuntimeException("No check-in found for today"));

        if (attendance.getCheckOut() != null) {
            throw new RuntimeException("Already checked out today");
        }

        attendance.setCheckOut(LocalTime.now(zoneId));
        // Calculate hours worked (simplistic)
        if (attendance.getCheckIn() != null) {
            long minutes = java.time.Duration.between(attendance.getCheckIn(), attendance.getCheckOut()).toMinutes();
            attendance.setHoursWorked(minutes / 60.0);
        }
        return mapToDto(attendanceRepository.save(attendance));
    }

    private AttendanceDto mapToDto(Attendance att) {
        String empName = userRepository.findById(att.getEmployeeId())
                .map(u -> u.getFirstName() + " " + u.getLastName())
                .orElse("Unknown");

        return AttendanceDto.builder()
                .id(att.getId().toString())
                .employeeId(att.getEmployeeId().toString())
                .employeeName(empName)
                .date(att.getDate().toString())
                .checkIn(att.getCheckIn() != null ? att.getCheckIn().toString() : null)
                .checkOut(att.getCheckOut() != null ? att.getCheckOut().toString() : null)
                .hoursWorked(att.getHoursWorked())
                .status(att.getStatus().name().toLowerCase())
                .notes(att.getNotes())
                .build();
    }

    public void resetAttendance() {
        attendanceRepository.deleteAll();
    }
}
