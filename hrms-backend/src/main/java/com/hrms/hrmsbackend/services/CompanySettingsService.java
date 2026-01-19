package com.hrms.hrmsbackend.services;

import com.hrms.hrmsbackend.models.CompanySettings;
import com.hrms.hrmsbackend.repositories.CompanySettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanySettingsService {

    private final CompanySettingsRepository repository;

    public CompanySettings getSettings() {
        List<CompanySettings> all = repository.findAll();
        if (all.isEmpty()) {
            return CompanySettings.builder()
                    .companyName("VistaarNet Enterprise")
                    .tagline("Empowering Workflow")
                    .address("123 Corporate Blvd")
                    .website("https://vistaarnet.com")
                    .contactEmail("admin@vistaarnet.com")
                    .build();
        }
        return all.get(0);
    }

    public CompanySettings updateSettings(CompanySettings settings) {
        List<CompanySettings> all = repository.findAll();
        CompanySettings existing;
        if (all.isEmpty()) {
            existing = new CompanySettings();
        } else {
            existing = all.get(0);
        }

        existing.setCompanyName(settings.getCompanyName());
        existing.setTagline(settings.getTagline());
        existing.setAddress(settings.getAddress());
        existing.setWebsite(settings.getWebsite());
        existing.setContactEmail(settings.getContactEmail());

        return repository.save(existing);
    }
}
