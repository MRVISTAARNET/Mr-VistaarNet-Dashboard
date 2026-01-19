import { api } from './api';
import { User } from '@/types';

// Mimics the frontend type, but we fetch from backend
export interface Employee extends User {
    phone: string;
    joinDate: string;
    location: string;
    departmentId?: string;
    positionId?: string;
}

interface EmployeeResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: string; // name
    position: string;   // name
    joiningDate: string;
    salary: number;
    status: string;
    avatar: string;
    role: string;
}

export const employeeService = {
    getAll: async (): Promise<Employee[]> => {
        const response = await api.get<EmployeeResponse[]>('/employees');
        return Array.isArray(response) ? response.map(e => mapToEmployee(e)) : [];
    },

    getById: async (id: string): Promise<Employee | undefined> => {
        try {
            const response = await api.get<EmployeeResponse>(`/employees/${id}`);
            return mapToEmployee(response);
        } catch (error) {
            return undefined;
        }
    },

    create: async (data: Partial<Employee> & { firstName?: string; lastName?: string }): Promise<Employee> => {
        // Backend expects RegisterRequest equivalent
        const payload = {
            firstName: data.firstName || data.name?.split(' ')[0] || 'Unknown',
            lastName: data.lastName || data.name?.split(' ').slice(1).join(' ') || 'Unknown',
            email: data.email,
            password: 'Password@123', // Default temporary password
            role: data.role?.toUpperCase() || 'EMPLOYEE',
            phone: data.phone,
            departmentId: data.departmentId,
            positionId: data.positionId,
            joiningDate: data.joinDate,
        };

        const response = await api.post<EmployeeResponse>('/employees', payload);
        return mapToEmployee(response);
    },

    update: async (id: string, data: Partial<Employee> & { firstName?: string; lastName?: string }): Promise<Employee> => {
        // Backend expects RegisterRequest-like structure for updates
        const payload = {
            firstName: data.firstName || (data.name ? data.name.split(' ')[0] : undefined),
            lastName: data.lastName || (data.name ? data.name.split(' ').slice(1).join(' ') : undefined),
            email: data.email,
            phone: data.phone,
            departmentId: data.departmentId,
            positionId: data.positionId,
            role: data.role?.toUpperCase(),
            joiningDate: data.joinDate,
        };
        const response = await api.put<EmployeeResponse>(`/employees/${id}`, payload);
        return mapToEmployee(response);
    },

    deactivate: async (id: string): Promise<void> => {
        await api.delete(`/employees/${id}`);
    }
};

function mapToEmployee(dto: EmployeeResponse): Employee {
    let role = dto.role ? dto.role.toLowerCase() : 'employee';

    // Normalize Spring Security roles
    if (role.includes('admin')) role = 'admin';
    if (role === 'role_employee') role = 'employee';

    return {
        id: dto.id,
        name: `${dto.firstName} ${dto.lastName}`,
        email: dto.email,
        role: role as any,
        status: dto.status.toLowerCase() as any,
        avatar: dto.avatar,
        // Show actual Department and Position for everyone, including Admins
        department: dto.department || 'Unknown Dept',
        position: dto.position || 'Unknown Pos',
        phone: dto.phone,
        joinDate: dto.joiningDate,
        location: 'Office' // Placeholder as backend doesn't store location yet
    };
}
