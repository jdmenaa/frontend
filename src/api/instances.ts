import { apiClient } from './client';
import { WorkflowInstance } from '../types';

export const instanceApi = {
  getByCompany: async (companyId: number): Promise<WorkflowInstance[]> => {
    const response = await apiClient.get(`/instances/company/${companyId}`);
    return response.data;
  },

  getById: async (id: number): Promise<WorkflowInstance> => {
    const response = await apiClient.get(`/instances/${id}`);
    return response.data;
  },

  create: async (userId: number, workflowId: number, instance: Partial<WorkflowInstance>): Promise<WorkflowInstance> => {
    const response = await apiClient.post(`/instances/user/${userId}/workflow/${workflowId}`, instance);
    return response.data;
  },
};
