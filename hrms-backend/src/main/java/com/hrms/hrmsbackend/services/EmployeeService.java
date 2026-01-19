package com.hrms.hrmsbackend.services;

import com.hrms.hrmsbackend.dtos.CoreDtos.EmployeeResponseDto;
import com.hrms.hrmsbackend.dtos.AuthDtos.RegisterRequest;
import com.hrms.hrmsbackend.models.User;
import com.hrms.hrmsbackend.repositories.DepartmentRepository;
import com.hrms.hrmsbackend.repositories.PositionRepository;
import com.hrms.hrmsbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

        private final UserRepository userRepository;
        private final DepartmentRepository departmentRepository;
        private final PositionRepository positionRepository;
        private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder; // Injected

        public List<EmployeeResponseDto> getAllEmployees() {
                return userRepository.findAll().stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        public EmployeeResponseDto getEmployeeById(Long id) {
                return userRepository.findById(id)
                                .map(this::mapToDto)
                                .orElse(null);
        }

        // Simplified create for now, mimicking frontend
        public EmployeeResponseDto createEmployee(RegisterRequest req) {
                // This reuses Auth DTO or we can create a specific EmployeeCreateDto
                // For now assuming we receive basic details
                var user = User.builder()
                                .firstName(req.getFirstName())
                                .lastName(req.getLastName())
                                .email(req.getEmail())
                                .password(passwordEncoder
                                                .encode(req.getPassword() != null ? req.getPassword() : "Password@123")) // Encrypt
                                                                                                                         // request
                                                                                                                         // password
                                                                                                                         // or
                                                                                                                         // default
                                .role(req.getRole() != null
                                                ? com.hrms.hrmsbackend.models.enums.Role
                                                                .valueOf(req.getRole().toUpperCase())
                                                : com.hrms.hrmsbackend.models.enums.Role.EMPLOYEE)
                                .status(com.hrms.hrmsbackend.models.enums.UserStatus.ACTIVE)
                                .isVerified(true)
                                .isFirstLogin(true) // Ensure they are prompted to change password
                                .departmentId(req.getDepartmentId())
                                .positionId(req.getPositionId())
                                .phone(req.getPhone())
                                .joiningDate(req.getJoiningDate() != null && !req.getJoiningDate().isEmpty()
                                                ? java.time.LocalDate.parse(req.getJoiningDate())
                                                : null)
                                .build();

                User saved = userRepository.save(user);
                return mapToDto(saved);
        }

        public EmployeeResponseDto updateEmployee(Long id, RegisterRequest req) {
                User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

                // Update fields if provided
                if (req.getFirstName() != null)
                        user.setFirstName(req.getFirstName());
                if (req.getLastName() != null)
                        user.setLastName(req.getLastName());
                if (req.getEmail() != null)
                        user.setEmail(req.getEmail());
                if (req.getPhone() != null)
                        user.setPhone(req.getPhone());
                if (req.getDepartmentId() != null)
                        user.setDepartmentId(req.getDepartmentId());
                if (req.getPositionId() != null)
                        user.setPositionId(req.getPositionId());
                if (req.getRole() != null)
                        user.setRole(com.hrms.hrmsbackend.models.enums.Role.valueOf(req.getRole().toUpperCase()));
                if (req.getJoiningDate() != null && !req.getJoiningDate().isEmpty())
                        user.setJoiningDate(java.time.LocalDate.parse(req.getJoiningDate()));

                // Assuming status updates might come separately or here
                // if (req.getStatus() != null) ...

                User saved = userRepository.save(user);
                return mapToDto(saved);
        }

        public void deactivateEmployee(Long id) {
                User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
                user.setStatus(com.hrms.hrmsbackend.models.enums.UserStatus.INACTIVE);
                userRepository.save(user);
        }

        private EmployeeResponseDto mapToDto(User user) {
                String deptName = "Unknown";
                if (user.getDepartmentId() != null) {
                        deptName = departmentRepository.findById(user.getDepartmentId())
                                        .map(d -> d.getName())
                                        .orElse("Unknown");
                }

                String posTitle = "Unknown";
                if (user.getPositionId() != null) {
                        posTitle = positionRepository.findById(user.getPositionId())
                                        .map(p -> p.getTitle())
                                        .orElse("Unknown");
                }

                String managerName = null;
                if (user.getManagerId() != null) {
                        managerName = userRepository.findById(user.getManagerId())
                                        .map(u -> u.getFirstName() + " " + u.getLastName())
                                        .orElse("Unknown");
                }

                return EmployeeResponseDto.builder()
                                .id(user.getId().toString())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .email(user.getEmail())
                                .phone(user.getPhone())
                                .department(deptName)
                                .position(posTitle)
                                .joiningDate(user.getJoiningDate() != null ? user.getJoiningDate().toString() : null)
                                .salary(user.getSalary())
                                .status(user.getStatus().name().toLowerCase())
                                .avatar(user.getAvatar())
                                .manager(managerName)
                                .role(user.getRole().name())
                                .build();
        }
}
