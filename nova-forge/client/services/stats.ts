import { api } from './api';

export interface DashboardStats {
    attendancePercentage: number;
    leaveBalance: number;
    pendingTasks: number;
    workingHours: number;
}

export const statsService = {
    getEmployeeStats: async (employeeId: string): Promise<DashboardStats> => {
        try {
            const res = await api.get<any>(`/analytics/employee/${employeeId}`);
            return {
                attendancePercentage: res.attendanceRate || 0,
                leaveBalance: res.leaveBalance || 0,
                pendingTasks: res.pendingTasks || 0,
                workingHours: res.avgWorkHours || 0,
            };
        } catch (error) {
            console.error("Failed to fetch employee stats:", error);
            // Fallback
            return {
                attendancePercentage: 0,
                leaveBalance: 0,
                pendingTasks: 0,
                workingHours: 0,
            };
        }
    },

    getAdminStats: async () => {
        const stats = await api.get<any>('/analytics/dashboard');
        return {
            totalEmployees: stats.totalEmployees,
            presentToday: stats.presentToday,
            onLeave: stats.onLeaveToday,
            pendingRequests: stats.pendingLeaveRequests,
        };
    },

    getReportsData: async () => {
        return await api.get<any>('/analytics/reports');
    }
};
