import { api } from './api';

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    receiverId?: string;
    receiverName?: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

interface MessageDto {
    id: string;
    senderId: string;
    senderName: string;
    receiverId?: string;
    receiverName?: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

export const messageService = {
    getAllMessages: async (): Promise<Message[]> => {
        const dtos = await api.get<any[]>('/messages');
        return Array.isArray(dtos) ? dtos.map(dto => ({
            id: dto.id,
            senderId: dto.senderId,
            senderName: dto.senderName,
            receiverId: dto.receiverId,
            receiverName: dto.receiverName,
            content: dto.content,
            timestamp: dto.timestamp,
            isRead: dto.isRead !== undefined ? dto.isRead : (dto.read !== undefined ? dto.read : false)
        })) : [];
    },

    sendMessage: async (message: { senderId: string, receiverId?: string, content: string }): Promise<Message> => {
        const payload = {
            senderId: message.senderId,
            receiverId: message.receiverId,
            content: message.content,
            // Backend handles Name and Timestamp
        };
        const dto = await api.post<any>('/messages', payload);
        return {
            id: dto.id,
            senderId: dto.senderId,
            senderName: dto.senderName,
            receiverId: dto.receiverId,
            receiverName: dto.receiverName,
            content: dto.content,
            timestamp: dto.timestamp,
            isRead: dto.isRead !== undefined ? dto.isRead : (dto.read !== undefined ? dto.read : false)
        };
    },

    markAsRead: async (id: string): Promise<void> => {
        await api.put(`/messages/${id}/read`, {});
    }
};
