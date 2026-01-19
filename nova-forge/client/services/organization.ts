import { Department, Position } from '@/types';
import { api } from './api';

export const organizationService = {
    getDepartments: async (): Promise<Department[]> => {
        // Backend: /api/departments returns DepartmentDto
        // Dto: id, name, code, manager, employeeCount, budget...
        // Frontend Type: id, name, head, employeeCount
        // Map manager -> head
        const dtos = await api.get<any[]>('/departments');
        return dtos.map(d => ({
            id: String(d.id),
            name: d.name,
            head: d.manager || 'Unassigned',
            employeeCount: d.employeeCount || 0
        }));
    },

    getPositions: async (): Promise<Position[]> => {
        // Backend: /api/positions
        const dtos = await api.get<any[]>('/positions');
        return dtos.map(p => ({
            id: String(p.id),
            title: p.title,
            departmentId: String(p.departmentId || '0'),
            departmentName: p.department, // Keep name for display if needed
            level: p.level || 'Mid'
        }));
    },

    createDepartment: async (name: string): Promise<void> => {
        await api.post('/departments', { name });
    },

    deleteDepartment: async (id: string): Promise<void> => {
        await api.delete(`/departments/${id}`);
    },

    updateDepartment: async (id: string, name: string): Promise<void> => {
        await api.put(`/departments/${id}`, { name });
    },

    createPosition: async (position: Partial<Position>): Promise<void> => {
        await api.post('/positions', {
            title: position.title,
            departmentId: position.departmentId,
            level: position.level
        });
    },

    updatePosition: async (id: string, position: Partial<Position>): Promise<void> => {
        await api.put(`/positions/${id}`, {
            title: position.title,
            departmentId: position.departmentId,
            level: position.level
        });
    },

    deletePosition: async (id: string): Promise<void> => {
        await api.delete(`/positions/${id}`);
    }
};
