export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'employee';
    avatar?: string;
    department?: string;
    position?: string;
    status: 'active' | 'inactive' | 'leave';
    isFirstLogin?: boolean;
}

export interface Department {
    id: string;
    name: string;
    head: string;
    employeeCount: number;
}

export interface Position {
    id: string;
    title: string;
    departmentId: string;
    level: string;
}
