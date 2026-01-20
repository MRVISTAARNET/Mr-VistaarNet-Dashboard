import React, { createContext, useState, useEffect } from 'react';
import { User } from '@/types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<any>; // returning user data for handling
  changePassword: (userId: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('user');
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403 || response.status === 404) {
          throw new Error('Login failed');
        }
        throw new Error(`Server Error: ${response.status}`);
      }

      const result = await response.json();
      const userData = {
        ...result.user,
        name: `${result.user.firstName} ${result.user.lastName}`,
        status: 'active'
      };

      // Check if password change is required
      if (userData.isFirstLogin && !data.isPasswordChangeFlow) {
        // Return immediately so UI can handle the form switch
        // We do NOT set user state yet if we want to force them to change it first
        // OR we set it but have a flag that redirects them.
        // Let's return the user data but NOT persist it fully or handling it in the component
        return userData;
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData; // Return for component to handle navigation
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (userId: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      });

      if (!response.ok) {
        console.error("Change password failed:", response.status, await response.text());
        throw new Error(`Failed to change password: ${response.status}`);
      }

      // If successful, we might need to update the local user state to reflect isFirstLogin = false
      if (user) {
        const updated = { ...user, isFirstLogin: false };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        let msg = `Request failed: ${response.status}`;
        try { msg = await response.text(); } catch (e) { }
        throw new Error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        let msg = `Reset failed: ${response.status}`;
        try { msg = await response.text(); } catch (e) { }
        throw new Error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };



  // Auto-refresh user data on mount/reload to ensure department and other fields are up to date
  useEffect(() => {
    const refreshUser = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`${API_URL}/api/users/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            const updatedUser = {
              ...user,
              ...data,
              // Backend might return firstName/lastName or just the DTO fields. 
              // Our DTO has firstName/lastName. Layout expects 'name'
              name: `${data.firstName} ${data.lastName}`,
              // Ensure department is set
              department: data.department
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (e) {
          console.error("Failed to refresh user data", e);
        }
      }
    };

    refreshUser();
  }, []); // Run once on mount

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        changePassword,
        forgotPassword,
        resetPassword,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
