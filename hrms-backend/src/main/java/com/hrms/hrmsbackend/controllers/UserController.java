package com.hrms.hrmsbackend.controllers;

import com.hrms.hrmsbackend.dtos.CoreDtos.ProfileUpdateDto;
import com.hrms.hrmsbackend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/{userId}/profile")
    public ResponseEntity<Void> updateProfile(@PathVariable String userId, @RequestBody ProfileUpdateDto dto) {
        try {
            Long id = Long.parseLong(userId);
            userService.updateProfile(id, dto);
            return ResponseEntity.ok().build();
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping(value = "/{userId}/avatar", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadAvatar(@PathVariable String userId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            Long id = Long.parseLong(userId);
            userService.uploadAvatar(id, file);
            return ResponseEntity.ok().build();
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
