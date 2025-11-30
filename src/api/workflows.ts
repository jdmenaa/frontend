import { apiClient } from './client';
import { WorkflowDefinition, User } from '../types';

export const workflowApi = {
  getByCompany: async (companyId: number): Promise<WorkflowDefinition[]> => {
    const response = await apiClient.get(`/workflows/company/${companyId}`);
    return response.data;
  },

  getById: async (id: number): Promise<WorkflowDefinition> => {
    const response = await apiClient.get(`/workflows/${id}`);
    return response.data;
  },

  create: async (companyId: number, workflow: WorkflowDefinition): Promise<WorkflowDefinition> => {
    const response = await apiClient.post(`/workflows/company/${companyId}`, workflow);
    return response.data;
  },

  update: async (id: number, workflow: WorkflowDefinition): Promise<WorkflowDefinition> => {
    const response = await apiClient.put(`/workflows/${id}`, workflow);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/workflows/${id}`);
  },
};

export const userApi = {
  getByCompany: async (companyId: number): Promise<User[]> => {
    const response = await apiClient.get(`/users/company/${companyId}`);
    return response.data;
  },

  getByRole: async (companyId: number, role: string): Promise<User[]> => {
    const response = await apiClient.get(`/users/company/${companyId}/role/${role}`);
    return response.data;
  },
};
