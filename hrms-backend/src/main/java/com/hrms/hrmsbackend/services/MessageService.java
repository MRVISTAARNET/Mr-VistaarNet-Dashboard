package com.hrms.hrmsbackend.services;

import com.hrms.hrmsbackend.dtos.CoreDtos.MessageDto;
import com.hrms.hrmsbackend.models.Message;
import com.hrms.hrmsbackend.repositories.MessageRepository;
import com.hrms.hrmsbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public List<MessageDto> getAllMessages() {
        return messageRepository.findAllByOrderByTimestampDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MessageDto sendMessage(MessageDto dto) {
        Message message = Message.builder()
                .senderId(Long.parseLong(dto.getSenderId()))
                .receiverId(dto.getReceiverId() != null ? Long.parseLong(dto.getReceiverId()) : null)
                .content(dto.getContent())
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();

        return mapToDto(messageRepository.save(message));
    }

    public void markAsRead(Long id) {
        Message message = messageRepository.findById(id).orElseThrow();
        message.setRead(true);
        messageRepository.save(message);
    }

    private MessageDto mapToDto(Message message) {
        String senderName = userRepository.findById(message.getSenderId())
                .map(u -> u.getFirstName() + " " + u.getLastName())
                .orElse("Unknown");
        String receiverName = message.getReceiverId() != null
                ? userRepository.findById(message.getReceiverId())
                        .map(u -> u.getFirstName() + " " + u.getLastName())
                        .orElse("Unknown")
                : null;

        return MessageDto.builder()
                .id(message.getId().toString())
                .senderId(message.getSenderId().toString())
                .senderName(senderName)
                .receiverId(message.getReceiverId() != null ? message.getReceiverId().toString() : null)
                .receiverName(receiverName)
                .content(message.getContent())
                .timestamp(message.getTimestamp().toString())
                .isRead(message.isRead())
                .build();
    }
}
