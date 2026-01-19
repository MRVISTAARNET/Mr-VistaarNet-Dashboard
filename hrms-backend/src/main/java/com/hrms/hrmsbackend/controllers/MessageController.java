package com.hrms.hrmsbackend.controllers;

import com.hrms.hrmsbackend.dtos.CoreDtos.MessageDto;
import com.hrms.hrmsbackend.services.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<List<MessageDto>> getAllMessages() {
        return ResponseEntity.ok(messageService.getAllMessages());
    }

    @PostMapping
    public ResponseEntity<MessageDto> sendMessage(@RequestBody MessageDto dto) {
        return ResponseEntity.ok(messageService.sendMessage(dto));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        messageService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
