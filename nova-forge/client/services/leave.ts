import { api } from './api';

export interface LeaveRequest {
    id: string;
    employeeId: string; // Renamed from userId to match backend
    employeeName: string;
    type: 'Sick' | 'Casual' | 'Earned' | 'Unpaid' | 'Maternity';
    startDate: string;
    endDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export const leaveService = {
    getMyLeaves: async (userId: string): Promise<LeaveRequest[]> => {
        const allLeaves = await api.get<LeaveRequest[]>('/leaves');
        return Array.isArray(allLeaves) ? allLeaves.filter(l => l.employeeId === userId.toString()) : [];
    },

    getAllLeaves: async (): Promise<LeaveRequest[]> => {
        const data = await api.get<LeaveRequest[]>('/leaves');
        return Array.isArray(data) ? data : [];
    },

    applyLeave: async (data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'employeeName'> & { employeeName?: string }): Promise<LeaveRequest> => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

        const payload = {
            employeeId: data.employeeId,
            type: data.type.toUpperCase(),
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.reason,
            days: diffDays
        };
        return api.post<LeaveRequest>('/leaves', payload);
    },

    updateStatus: async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
        if (status === 'approved') {
            await api.put(`/leaves/${id}/approve?approvedBy=${localStorage.getItem('userId') || '1'}`, {});
        } else {
            await api.put(`/leaves/${id}/reject`, {});
        }
    }
};
