import { apiClient } from './client';
import { LoginResponse } from '../types';

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },
};
