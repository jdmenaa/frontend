import { apiClient } from './client';
import { ApprovalTask } from '../types';

export const taskApi = {
  getPending: async (userId: number): Promise<ApprovalTask[]> => {
    const response = await apiClient.get(`/tasks/user/${userId}/pending`);
    return response.data;
  },

  countPending: async (userId: number): Promise<number> => {
    const response = await apiClient.get(`/tasks/user/${userId}/count`);
    return response.data;
  },

  approve: async (taskId: number, comments: string): Promise<ApprovalTask> => {
    const response = await apiClient.post(`/tasks/${taskId}/approve`, { comments });
    return response.data;
  },

  reject: async (taskId: number, comments: string): Promise<ApprovalTask> => {
    const response = await apiClient.post(`/tasks/${taskId}/reject`, { comments });
    return response.data;
  },
};
