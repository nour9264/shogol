'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, userService } from '@/services/api';
import { jwtDecode } from 'jwt-decode';
import type { User, RegisterData, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFreelancer: boolean;
  isClient: boolean;
  login: (emailOrPhone: string, password: string) => Promise<{ success: boolean; data?: AuthResponse; error?: string }>;
  register: (userData: RegisterData, profilePicture?: File) => Promise<{ success: boolean; data?: AuthResponse; error?: string }>;
  verifyOtp: (phoneNumber: string, otpCode: string) => Promise<{ success: boolean; data?: AuthResponse; error?: string }>;
  resendOtp: (phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode<{ exp: number }>(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (emailOrPhone: string, password: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`%c[🔐 AUTH CONTEXT] ${timestamp} - Starting Login`, 'color: #2196F3; font-weight: bold;');

    try {
      const response = await authService.login({ emailOrPhone, password });
      const { token: responseToken, user: responseUser } = response.data;

      setToken(responseToken || null);
      setUser(responseUser || null);
      if (typeof window !== 'undefined' && responseToken && responseUser) {
        localStorage.setItem('token', responseToken);
        localStorage.setItem('user', JSON.stringify(responseUser));
      }

      return { success: true, data: response.data };
    } catch (error: any) {
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';

      if (error.response?.data) {
        if (error.response.data.errors) {
          const errors = Object.values(error.response.data.errors).flat() as string[];
          errorMessage = errors.join(', ') || errorMessage;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.request) {
        errorMessage = 'لا يمكن الاتصال بالخادم. تأكد من تشغيل Backend API';
      } else {
        errorMessage = error.message || errorMessage;
      }

      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: RegisterData, profilePicture?: File) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`%c[🔐 AUTH CONTEXT] ${timestamp} - Starting Registration`, 'color: #2196F3; font-weight: bold;');
    console.log('%c[📋 Registration Data]', 'color: #4CAF50; font-weight: bold;', userData);
    console.log('%c[🖼️ Profile Picture]', 'color: #4CAF50; font-weight: bold;', profilePicture ? `${profilePicture.name} (${profilePicture.size} bytes)` : 'None');

    try {
      const response = await authService.register(userData, profilePicture);

      // Registration successful - user needs to verify OTP
      // Don't set token/user yet as they need to verify first
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('%c[❌ Registration Error]', 'color: #F44336; font-weight: bold;', error);
      let errorMessage = 'حدث خطأ أثناء التسجيل';

      if (error.response?.data) {
        console.error('%c[📦 Error Response Data]', 'color: #F44336; font-weight: bold;', error.response.data);

        if (error.response.data.errors) {
          const errors = Object.values(error.response.data.errors).flat() as string[];
          errorMessage = errors.join(', ') || errorMessage;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
          // Check if it's actually a success message (backend returns 200 but might be caught)
          if (errorMessage.includes('Registration successful') || errorMessage.includes('تم التسجيل')) {
            return { success: true, data: error.response.data };
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.title) {
          // Sometimes .NET returns validation errors in 'title' field
          errorMessage = error.response.data.title;
        }
      } else if (error.request) {
        errorMessage = 'لا يمكن الاتصال بالخادم. تأكد من تشغيل Backend API';
      } else {
        errorMessage = error.message || errorMessage;
      }

      console.error('%c[💬 Final Error Message]', 'color: #F44336; font-weight: bold;', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const verifyOtp = async (phoneNumber: string, otpCode: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`%c[🔐 AUTH CONTEXT] ${timestamp} - Verifying OTP`, 'color: #2196F3; font-weight: bold;');

    try {
      const response = await authService.verifyOtp({ phoneNumber, otpCode });
      const { token: responseToken, user: responseUser } = response.data;

      if (responseToken && responseUser) {
        setToken(responseToken);
        setUser(responseUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', responseToken);
          localStorage.setItem('user', JSON.stringify(responseUser));
        }
      }

      return { success: true, data: response.data };
    } catch (error: any) {
      let errorMessage = 'رمز التحقق غير صحيح';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return { success: false, error: errorMessage };
    }
  };

  const resendOtp = async (phoneNumber: string) => {
    try {
      await authService.resendOtp(phoneNumber);
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'فشل إعادة إرسال رمز التحقق';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const refreshProfile = async () => {
    if (!token) return;

    try {
      const response = await userService.getProfile();
      if (response.data) {
        updateUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isFreelancer: user?.isFreelancer || false,
    isClient: user?.isClient || false,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    updateUser,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
