import apiClient from '@/lib/api-client';
import { storage } from '@/lib/storage';
import { User } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

interface DecodedToken {
  userId: string;
  role: 'resident' | 'organizer';
  iat: number;
  exp: number;
}

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromToken();
  }, []);

  const loadUserFromToken = async () => {
    try {
      const token = await storage.getToken();
      if (token) {
        const response = await apiClient.get('/auth/me');
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to load user from token:', error);
      await storage.deleteToken(); // Clear invalid token
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      await storage.setToken(token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message || 'Login failed. Please try again.';
      console.error('Login error:', message);
      return { success: false, message };
    }
  };
  
  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/register', { username, email, password });
      // After successful registration, log the user in
      return await login(email, password);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message || 'Registration failed. Please try again.';
      console.error('Registration error:', message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    setUser(null);
    await storage.deleteToken();
  };
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
});