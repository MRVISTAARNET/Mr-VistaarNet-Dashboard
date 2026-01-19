package com.hrms.hrmsbackend.services;

import com.hrms.hrmsbackend.dtos.CoreDtos.DepartmentDto;
import com.hrms.hrmsbackend.models.Department;
import com.hrms.hrmsbackend.repositories.DepartmentRepository;
import com.hrms.hrmsbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DepartmentDto createDepartment(DepartmentDto dto) {
        Department dept = Department.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .budget(dto.getBudget())
                .description(dto.getDescription())
                .build();
        Department saved = departmentRepository.save(dept);
        return mapToDto(saved);
    }

    public DepartmentDto updateDepartment(Long id, DepartmentDto dto) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        if (dto.getName() != null)
            dept.setName(dto.getName());
        if (dto.getCode() != null)
            dept.setCode(dto.getCode());
        if (dto.getBudget() != null)
            dept.setBudget(dto.getBudget());
        if (dto.getDescription() != null)
            dept.setDescription(dto.getDescription());
        // Handle manager update if needed

        Department saved = departmentRepository.save(dept);
        return mapToDto(saved);
    }

    public void deleteDepartment(Long id) {
        if (userRepository.countByDepartmentId(id) > 0) {
            throw new RuntimeException("Cannot delete department with assigned employees");
        }
        departmentRepository.deleteById(id);
    }

    // Helper to map entity to DTO (fetching manager name)
    private DepartmentDto mapToDto(Department dept) {
        String managerName = null;
        if (dept.getManagerId() != null) {
            managerName = userRepository.findById(dept.getManagerId())
                    .map(u -> u.getFirstName() + " " + u.getLastName())
                    .orElse("Unknown");
        }

        Integer empCount = userRepository.countByDepartmentId(dept.getId());

        return DepartmentDto.builder()
                .id(dept.getId().toString())
                .name(dept.getName())
                .code(dept.getCode())
                .manager(managerName)
                .budget(dept.getBudget())
                .description(dept.getDescription())
                .employeeCount(empCount)
                .build();
    }
}
