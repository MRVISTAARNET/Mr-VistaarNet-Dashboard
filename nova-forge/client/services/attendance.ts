import { api } from './api';

export interface AttendanceRecord {
    id: string;
    employeeId: string; // Renamed from userId
    employeeName: string; // Renamed from userName
    date: string;
    checkIn: string;
    checkOut?: string;
    status: 'present' | 'late' | 'half-day' | 'absent';
    hoursWorked?: number; // Renamed from totalHours (string) to hoursWorked (number)
}

export const attendanceService = {
    getMyAttendance: async (userId: string): Promise<AttendanceRecord[]> => {
        // Backend filters by current user automatically or we pass userId
        // Endpoint: GET /api/attendance?employeeId=userId
        const data = await api.get<AttendanceRecord[]>(`/attendance?employeeId=${userId}`);
        return Array.isArray(data) ? data : [];
    },

    getAllAttendance: async (): Promise<AttendanceRecord[]> => {
        const data = await api.get<AttendanceRecord[]>('/attendance');
        return Array.isArray(data) ? data : [];
    },

    checkIn: async (userId: string): Promise<AttendanceRecord> => {
        return api.post<AttendanceRecord>(`/attendance/check-in/${userId}`, {});
    },

    checkOut: async (userId: string): Promise<void> => {
        return api.put<void>(`/attendance/check-out/${userId}`, {});
    }
};
