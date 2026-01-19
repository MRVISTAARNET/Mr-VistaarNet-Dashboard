package com.hrms.hrmsbackend.repositories;

import com.hrms.hrmsbackend.models.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findAllByOrderByDateDesc();
}
