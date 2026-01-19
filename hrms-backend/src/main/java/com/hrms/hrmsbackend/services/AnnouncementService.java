package com.hrms.hrmsbackend.services;

import com.hrms.hrmsbackend.dtos.CoreDtos.AnnouncementDto;
import com.hrms.hrmsbackend.models.Announcement;
import com.hrms.hrmsbackend.repositories.AnnouncementRepository;
import com.hrms.hrmsbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    public List<AnnouncementDto> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByDateDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AnnouncementDto createAnnouncement(AnnouncementDto dto, Long userId) {
        Announcement announcement = Announcement.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .date(LocalDate.now())
                .postedBy(userId)
                .priority(dto.getPriority() != null ? dto.getPriority() : "Medium")
                .build();
        return mapToDto(announcementRepository.save(announcement));
    }

    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }

    private AnnouncementDto mapToDto(Announcement announcement) {
        String posterName = "System";
        if (announcement.getPostedBy() != null) {
            posterName = userRepository.findById(announcement.getPostedBy())
                    .map(u -> u.getFirstName() + " " + u.getLastName())
                    .orElse("Unknown");
        }

        return AnnouncementDto.builder()
                .id(announcement.getId().toString())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .date(announcement.getDate().toString())
                .postedBy(posterName)
                .priority(announcement.getPriority())
                .build();
    }
}
