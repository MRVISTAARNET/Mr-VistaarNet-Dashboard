import { api } from './api';

export interface Task {
    id: string;
    title: string;
    description: string;
    assigneeId: string; // backend: assignedTo
    assigneeName?: string; // Additional logic needed if backed doesn't send name
    dueDate: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Todo' | 'In Progress' | 'Review' | 'Completed';
    createdAt: string;
}

interface TaskDto {
    id: string;
    title: string;
    description: string;
    assignedTo: string; // name
    assignedToId: string; // ID
    assignedBy: string;
    dueDate: string;
    priority: string;
    status: string;
    progress: number;
    createdAt: string;
    tags: string[];
}

export const taskService = {
    getAllTasks: async (): Promise<Task[]> => {
        const dtos = await api.get<TaskDto[]>('/tasks');
        return Array.isArray(dtos) ? dtos.map(mapToTask) : [];
    },

    getMyTasks: async (userId: string): Promise<Task[]> => {
        const all = await taskService.getAllTasks();
        return all.filter(t => t.assigneeId === userId.toString());
    },

    createTask: async (task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
        const payload = {
            title: task.title,
            description: task.description,
            assignedToId: task.assigneeId, // Sending ID to backend
            dueDate: task.dueDate,
            priority: task.priority.toUpperCase(),
            status: 'TODO'
        };
        const dto = await api.post<TaskDto>('/tasks', payload);
        return mapToTask(dto);
    },
    // ... (keep updateStatus/deleteTask logs, omitting to save tokens if unedited)
    updateStatus: async (taskId: string, status: Task['status']): Promise<void> => {
        // Map frontend enum to backend string if needed, or send as is strictly
        // Backend expects upper case or compatible string.
        // TaskStatus in backend is TODO, IN_PROGRESS, REVIEW, DONE/COMPLETED?
        // Let's check backend enum. TaskService uses TaskStatus.valueOf(dto.getStatus().toUpperCase())
        // So we send 'IN PROGRESS' -> 'IN_PROGRESS' or 'Completed' -> 'COMPLETED'.
        // Wait, backend Enum usually underscores.
        // Let's sanitise: 'In Progress' -> 'IN_PROGRESS'
        const backendStatus = status.toUpperCase().replace(' ', '_');

        await api.put<TaskDto>(`/tasks/${taskId}`, {
            status: backendStatus
        } as Partial<TaskDto>);
    },
    deleteTask: async (taskId: string): Promise<void> => {
        await api.delete(`/tasks/${taskId}`);
    }
};

function mapToTask(dto: TaskDto): Task {
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        assigneeId: dto.assignedToId || '', // Use real ID
        assigneeName: dto.assignedTo,       // Use Name
        dueDate: dto.dueDate,
        priority: formatEnum(dto.priority),
        status: formatEnum(dto.status),
        createdAt: dto.createdAt
    } as Task;
}

function formatEnum(val: string): any {
    if (!val) return '';
    // CONSTANT_CASE to Title Case
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase().replace('_', ' ');
}
