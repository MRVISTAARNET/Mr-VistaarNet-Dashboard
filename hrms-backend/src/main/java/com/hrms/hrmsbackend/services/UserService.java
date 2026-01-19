package com.hrms.hrmsbackend.services;

import com.hrms.hrmsbackend.dtos.CoreDtos.ProfileUpdateDto;
import com.hrms.hrmsbackend.models.User;
import com.hrms.hrmsbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public void updateProfile(Long userId, ProfileUpdateDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getFullName() != null && !dto.getFullName().isEmpty()) {
            String[] parts = dto.getFullName().split(" ", 2);
            user.setFirstName(parts[0]);
            if (parts.length > 1) {
                user.setLastName(parts[1]);
            } else {
                user.setLastName("");
            }
        }

        if (dto.getAvatar() != null) {
            user.setAvatar(dto.getAvatar());
        }

        userRepository.save(user);
    }

    public void uploadAvatar(Long userId, org.springframework.web.multipart.MultipartFile file) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String uploadDir = "uploads/avatars/";
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            String fileName = java.util.UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            java.nio.file.Path filePath = uploadPath.resolve(fileName);
            java.nio.file.Files.copy(file.getInputStream(), filePath,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "http://localhost:8080/uploads/avatars/" + fileName;
            user.setAvatar(fileUrl);
            userRepository.save(user);

        } catch (java.io.IOException e) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!", e);
        }
    }
}
