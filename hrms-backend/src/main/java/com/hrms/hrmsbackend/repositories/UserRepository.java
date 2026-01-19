package com.hrms.hrmsbackend.repositories;

import com.hrms.hrmsbackend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    java.util.Optional<com.hrms.hrmsbackend.models.User> findByEmail(String email);

    java.util.Optional<com.hrms.hrmsbackend.models.User> findByOtp(String otp);

    boolean existsByEmail(String email);

    Integer countByDepartmentId(Long departmentId);
}
