package com.hrms.hrmsbackend.services;

import com.hrms.hrmsbackend.dtos.CoreDtos.TaskDto;
import com.hrms.hrmsbackend.models.Task;
import com.hrms.hrmsbackend.models.enums.TaskPriority;
import com.hrms.hrmsbackend.models.enums.TaskStatus;
import com.hrms.hrmsbackend.repositories.TaskRepository;
import com.hrms.hrmsbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getTasksByAssignee(Long employeeId) {
        return taskRepository.findByAssignedTo(employeeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public TaskDto createTask(TaskDto dto) {
        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .assignedTo(parseId(dto.getAssignedToId()))
                .assignedBy(1L) // Default admin
                .dueDate(LocalDate.parse(dto.getDueDate()))
                .priority(TaskPriority.valueOf(dto.getPriority().toUpperCase()))
                .status(TaskStatus.TODO)
                .progress(0)
                .tags(dto.getTags())
                .build();
        return mapToDto(taskRepository.save(task));
    }

    public TaskDto updateTask(Long id, TaskDto dto) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));

        if (dto.getTitle() != null)
            task.setTitle(dto.getTitle());
        if (dto.getDescription() != null)
            task.setDescription(dto.getDescription());
        if (dto.getAssignedToId() != null)
            task.setAssignedTo(parseId(dto.getAssignedToId()));
        if (dto.getDueDate() != null)
            task.setDueDate(LocalDate.parse(dto.getDueDate()));
        if (dto.getPriority() != null)
            task.setPriority(TaskPriority.valueOf(dto.getPriority().toUpperCase()));
        if (dto.getStatus() != null)
            task.setStatus(TaskStatus.valueOf(dto.getStatus().toUpperCase()));
        if (dto.getProgress() != null)
            task.setProgress(dto.getProgress());
        if (dto.getTags() != null)
            task.setTags(dto.getTags());

        return mapToDto(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    private Long parseId(String idStr) {
        try {
            return Long.parseLong(idStr);
        } catch (NumberFormatException e) {
            return null; // Or handle if name is passed
        }
    }

    private TaskDto mapToDto(Task task) {
        String assigneeName = userRepository.findById(task.getAssignedTo())
                .map(u -> u.getFirstName() + " " + u.getLastName())
                .orElse("Unknown");

        String assignedByName = "System";
        if (task.getAssignedBy() != null) {
            assignedByName = userRepository.findById(task.getAssignedBy())
                    .map(u -> u.getFirstName() + " " + u.getLastName())
                    .orElse("Unknown");
        }

        return TaskDto.builder()
                .id(task.getId().toString())
                .title(task.getTitle())
                .description(task.getDescription())
                .assignedTo(assigneeName) // Frontend expects name usually in list
                .assignedToId(task.getAssignedTo().toString())
                .assignedBy(assignedByName)
                .dueDate(task.getDueDate().toString())
                .priority(task.getPriority().name().toLowerCase())
                .status(task.getStatus().name().toLowerCase())
                .progress(task.getProgress())
                .createdAt(task.getCreatedAt().toString())
                .tags(task.getTags())
                .build();
    }
}
