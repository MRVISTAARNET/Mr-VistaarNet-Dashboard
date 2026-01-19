import { api } from './api';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    postedBy: string; // Name
    priority: 'Low' | 'Medium' | 'High';
}

export const announcementService = {
    getAll: async (): Promise<Announcement[]> => {
        const data = await api.get<Announcement[]>('/announcements');
        return Array.isArray(data) ? data : [];
    },

    create: async (data: { title: string; content: string; priority: string }, userId: string): Promise<Announcement> => {
        return api.post<Announcement>(`/announcements?userId=${userId}`, data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/announcements/${id}`);
    }
};
