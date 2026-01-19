package com.hrms.hrmsbackend.controllers;

import com.hrms.hrmsbackend.dtos.CoreDtos.PositionDto;
import com.hrms.hrmsbackend.services.PositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/positions")
@RequiredArgsConstructor
public class PositionController {

    private final PositionService positionService;

    @GetMapping
    public ResponseEntity<List<PositionDto>> getAllPositions() {
        return ResponseEntity.ok(positionService.getAllPositions());
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ResponseEntity<PositionDto> createPosition(
            @org.springframework.web.bind.annotation.RequestBody PositionDto dto) {
        return ResponseEntity.ok(positionService.createPosition(dto));
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public ResponseEntity<PositionDto> updatePosition(@org.springframework.web.bind.annotation.PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody PositionDto dto) {
        return ResponseEntity.ok(positionService.updatePosition(id, dto));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePosition(@org.springframework.web.bind.annotation.PathVariable Long id) {
        positionService.deletePosition(id);
        return ResponseEntity.ok().build();
    }
}
