package com.hrms.hrmsbackend.repositories;

import com.hrms.hrmsbackend.models.WorkReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkReportRepository extends JpaRepository<WorkReport, Long> {
    List<WorkReport> findByEmployeeId(Long employeeId);

    List<WorkReport> findByDate(LocalDate date);
}
