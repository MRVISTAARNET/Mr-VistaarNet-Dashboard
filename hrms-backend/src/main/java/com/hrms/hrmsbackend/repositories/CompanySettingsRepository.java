package com.hrms.hrmsbackend.repositories;

import com.hrms.hrmsbackend.models.CompanySettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanySettingsRepository extends JpaRepository<CompanySettings, Long> {
}
