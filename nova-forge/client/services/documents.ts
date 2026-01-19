import { api } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface Document {
    id: string;
    employeeId: string;
    employeeName: string;
    type: 'personal' | 'legal' | 'payroll' | 'policy' | 'other';
    fileName: string;
    uploadDate: string;
    status: 'pending' | 'verified' | 'rejected';
    verifiedBy?: string;
    verifiedDate?: string;
    fileUrl: string;
    category?: string; // Frontend helper
}

interface DocumentDto {
    id: string;
    employeeId: string;
    employeeName: string;
    type: string;
    fileName: string;
    uploadDate: string;
    status: string;
    verifiedBy: string;
    verifiedDate: string;
    fileUrl: string;
    category?: string;
}

export const documentService = {
    getAllDocuments: async (): Promise<Document[]> => {
        const dtos = await api.get<DocumentDto[]>('/documents');
        return dtos.map(mapToDocument);
    },

    getMyDocuments: async (userId: string): Promise<Document[]> => {
        const dtos = await api.get<DocumentDto[]>(`/documents/employee/${userId}`);
        return dtos.map(mapToDocument);
    },

    uploadDocument: async (doc: Partial<Document>): Promise<Document> => {
        const payload = {
            employeeId: doc.employeeId,
            type: doc.type?.toUpperCase() || 'OTHER',
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
        };
        const dto = await api.post<DocumentDto>('/documents/upload', payload);
        return mapToDocument(dto);
    },

    uploadFile: async (formData: FormData): Promise<Document> => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/documents/upload-file`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Upload failed: ${errorText || res.statusText}`);
        }
        const dto = await res.json();
        return mapToDocument(dto);
    },

    deleteDocument: async (id: string): Promise<void> => {
        await api.delete(`/documents/${id}`);
    }
};

function mapToDocument(dto: DocumentDto): Document {
    return {
        ...dto,
        type: (dto.type.toLowerCase() as any),
        status: (dto.status.toLowerCase() as any),
        category: getCategory(dto.type) // Helper to map type to UI category
    };
}

function getCategory(type: string): string {
    const t = type.toLowerCase();
    if (t === 'personal') return 'Personal';
    if (t === 'legal') return 'Legal';
    if (t === 'payroll') return 'Payroll';
    if (t === 'policy') return 'Policy';
    return 'Other';
}
