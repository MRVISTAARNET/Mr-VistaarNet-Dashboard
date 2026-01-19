const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_BASE_URL = `${API_URL}/api`;

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

class ApiService {
    private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
        const token = localStorage.getItem('token');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const config: RequestInit = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    throw new Error('Unauthorized');
                }
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `API Error: ${response.statusText}`;
                const errorDetails = errorData.details ? ` (${errorData.details})` : '';
                throw new Error(`${errorMessage}${errorDetails}`);
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return {} as T;
            }

            const text = await response.text();
            try {
                return text ? JSON.parse(text) : {} as T;
            } catch (e) {
                console.warn('Failed to parse JSON response:', text);
                return {} as T; // Fallback for non-JSON or empty responses that aren't 204
            }
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    post<T>(endpoint: string, data: any, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    put<T>(endpoint: string, data: any, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const api = new ApiService();
