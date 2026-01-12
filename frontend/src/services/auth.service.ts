import { api, getErrorMessage } from './api';
import {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  Login2FARequest,
  AuthResponse,
} from '../types';

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  login2FA: async (data: Login2FARequest): Promise<{ token: string }> => {
    try {
      const response = await api.post<{ token: string }>('/auth/login-2fa', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

