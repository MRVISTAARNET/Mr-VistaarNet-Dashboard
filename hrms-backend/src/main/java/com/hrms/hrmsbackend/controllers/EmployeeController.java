package com.hrms.hrmsbackend.controllers;

import com.hrms.hrmsbackend.dtos.CoreDtos.EmployeeResponseDto;
import com.hrms.hrmsbackend.dtos.AuthDtos.RegisterRequest;
import com.hrms.hrmsbackend.services.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<List<EmployeeResponseDto>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponseDto> getEmployeeById(@PathVariable Long id) {
        EmployeeResponseDto emp = employeeService.getEmployeeById(id);
        return emp != null ? ResponseEntity.ok(emp) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<EmployeeResponseDto> createEmployee(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(employeeService.createEmployee(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponseDto> updateEmployee(@PathVariable Long id,
            @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateEmployee(@PathVariable Long id) {
        System.out.println("Received deactivate request for ID: " + id);
        try {
            employeeService.deactivateEmployee(id);
            System.out.println("Deactivated successfully");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error deactivating employee: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
