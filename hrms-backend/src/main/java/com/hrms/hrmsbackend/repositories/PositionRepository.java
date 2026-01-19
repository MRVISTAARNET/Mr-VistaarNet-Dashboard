package com.hrms.hrmsbackend.repositories;

import com.hrms.hrmsbackend.models.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {
    List<Position> findByDepartmentId(Long departmentId);
}
