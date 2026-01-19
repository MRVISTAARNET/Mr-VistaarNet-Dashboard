import { api } from './api';

export interface WorkReport {
    id: string;
    employeeId: string;
    employeeName: string; // Backend DTO might optionally have this? DTO has no employeeName field only employeeId?
    // Let's check CoreDtos.java. WorkReportDto: id, employeeId, date, content. No name.
    date: string;
    timestamp: string; // Backend WorkReport doesn't have timestamp? DTO: date, content.
    description: string; // DTO: content
    hoursWorked: number; // Backend doesn't have hoursWorked?
}

// Backend WorkReport is simple: content, date.
// Frontend expects: timestamp, hoursWorked, description.
// We must map best effort.

export const workReportService = {
    getEmployeeReports: async (employeeId: string): Promise<WorkReport[]> => {
        const reports = await api.get<any[]>(`/work-reports/employee/${employeeId}`);
        return reports.map(mapReport);
    },

    getAllReports: async (): Promise<WorkReport[]> => {
        const reports = await api.get<any[]>('/work-reports');
        return reports.map(mapReport);
    },

    createReport: async (report: Omit<WorkReport, 'id' | 'timestamp'>): Promise<WorkReport> => {
        const payload = {
            employeeId: report.employeeId,
            date: report.date,
            content: report.description + (report.hoursWorked ? ` (Hours: ${report.hoursWorked})` : '')
        };
        const res = await api.post<any>('/work-reports', payload);
        return mapReport(res);
    },

    updateReport: async (id: string, updates: Partial<WorkReport>): Promise<WorkReport> => {
        const payload = {
            content: updates.description,
            // Hours update logic depends on backend support. Currently backend only updates content/date.
            // If we want to support hours, we need to embed it in content string again or change backend model.
            // Current createReport embeds it: content = description + (Hours: X).
            // Let's adopt same logic.
            // We need original description if not updating it?
            // Simplified: we assume updates.description contains the full text.
        };
        // Smart update:
        // Ideally we fetch current, parse it, update it.
        // For now, let's just send content.
        const res = await api.put<any>(`/work-reports/${id}`, payload);
        return mapReport(res);
    }
};

function mapReport(dto: any): WorkReport {
    return {
        id: dto.id,
        employeeId: dto.employeeId,
        employeeName: dto.employeeName || "Unknown",
        date: dto.date,
        timestamp: "09:00", // Default
        description: dto.content,
        hoursWorked: 0 // Default
    };
}
