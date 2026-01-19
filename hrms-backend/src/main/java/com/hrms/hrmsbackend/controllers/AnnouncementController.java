package com.hrms.hrmsbackend.controllers;

import com.hrms.hrmsbackend.dtos.CoreDtos.AnnouncementDto;
import com.hrms.hrmsbackend.services.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<List<AnnouncementDto>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    @PostMapping
    public ResponseEntity<AnnouncementDto> createAnnouncement(
            @RequestBody AnnouncementDto dto,
            @RequestParam Long userId) {
        return ResponseEntity.ok(announcementService.createAnnouncement(dto, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }
}
