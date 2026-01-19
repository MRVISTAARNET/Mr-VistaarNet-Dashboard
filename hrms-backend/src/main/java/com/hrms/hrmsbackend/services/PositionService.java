package com.hrms.hrmsbackend.services;

import com.hrms.hrmsbackend.dtos.CoreDtos.PositionDto;
import com.hrms.hrmsbackend.dtos.CoreDtos.SalaryRange;
import com.hrms.hrmsbackend.models.Position;
import com.hrms.hrmsbackend.repositories.DepartmentRepository;
import com.hrms.hrmsbackend.repositories.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PositionService {

    private final PositionRepository positionRepository;
    private final DepartmentRepository departmentRepository;

    public List<PositionDto> getAllPositions() {
        return positionRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PositionDto createPosition(PositionDto dto) {
        Position pos = Position.builder()
                .title(dto.getTitle())
                .departmentId(dto.getDepartmentId() != null ? Long.parseLong(dto.getDepartmentId()) : null)
                .level(dto.getLevel())
                .salaryMin(dto.getSalaryRange() != null ? dto.getSalaryRange().getMin() : null)
                .salaryMax(dto.getSalaryRange() != null ? dto.getSalaryRange().getMax() : null)
                .responsibilities(dto.getResponsibilities())
                .requirements(dto.getRequirements())
                .openings(dto.getOpenings())
                .build();
        return mapToDto(positionRepository.save(pos));
    }

    public PositionDto updatePosition(Long id, PositionDto dto) {
        Position pos = positionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        if (dto.getTitle() != null)
            pos.setTitle(dto.getTitle());
        if (dto.getDepartmentId() != null) {
            try {
                pos.setDepartmentId(Long.parseLong(dto.getDepartmentId()));
            } catch (NumberFormatException e) {
                // Ignore invalid department ID or log error
            }
        }
        if (dto.getLevel() != null)
            pos.setLevel(dto.getLevel());
        if (dto.getSalaryRange() != null) {
            if (dto.getSalaryRange().getMin() != null)
                pos.setSalaryMin(dto.getSalaryRange().getMin());
            if (dto.getSalaryRange().getMax() != null)
                pos.setSalaryMax(dto.getSalaryRange().getMax());
        }
        if (dto.getResponsibilities() != null)
            pos.setResponsibilities(dto.getResponsibilities());
        if (dto.getRequirements() != null)
            pos.setRequirements(dto.getRequirements());
        if (dto.getOpenings() != null)
            pos.setOpenings(dto.getOpenings());

        return mapToDto(positionRepository.save(pos));
    }

    public void deletePosition(Long id) {
        positionRepository.deleteById(id);
    }

    private PositionDto mapToDto(Position pos) {
        String deptName = departmentRepository.findById(pos.getDepartmentId())
                .map(d -> d.getName())
                .orElse("Unknown");

        return PositionDto.builder()
                .id(pos.getId().toString())
                .title(pos.getTitle())
                .departmentId(pos.getDepartmentId() != null ? pos.getDepartmentId().toString() : null)
                .department(deptName)
                .level(pos.getLevel())
                .salaryRange(new SalaryRange(pos.getSalaryMin(), pos.getSalaryMax()))
                .responsibilities(pos.getResponsibilities())
                .requirements(pos.getRequirements())
                .openings(pos.getOpenings())
                .build();
    }
}
