import axios from 'axios';
import type {
  GlobalModule,
  GlobalOperation,
  CompanyRole,
  CompanyProfile,
  GlobalTemplate,
  TemplateDetailsResponse,
  CreateGlobalModuleRequest,
  CreateCompanyRoleRequest,
  CreateCompanyProfileRequest
} from '../types/access-management';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const globalModulesApi = {
  getAll: () => axios.get<GlobalModule[]>(`${API_BASE}/global-modules`),
  getById: (id: number) => axios.get<GlobalModule>(`${API_BASE}/global-modules/${id}`),
  create: (data: CreateGlobalModuleRequest) => axios.post(`${API_BASE}/global-modules`, data),
  update: (id: number, data: CreateGlobalModuleRequest) => axios.put(`${API_BASE}/global-modules/${id}`, data),
  delete: (id: number) => axios.delete(`${API_BASE}/global-modules/${id}`)
};

export const globalOperationsApi = {
  getAll: () => axios.get<GlobalOperation[]>(`${API_BASE}/global-operations`),
  getByModuleId: (moduleId: number) => axios.get<GlobalOperation[]>(`${API_BASE}/global-operations/by-module/${moduleId}`),
  create: (data: any) => axios.post(`${API_BASE}/global-operations`, data)
};

export const companyRolesApi = {
  getByCompanyId: (companyId: number) => axios.get<CompanyRole[]>(`${API_BASE}/company-roles/by-company/${companyId}`),
  create: (data: CreateCompanyRoleRequest) => axios.post(`${API_BASE}/company-roles`, data)
};

export const companyProfilesApi = {
  getByCompanyId: (companyId: number) => axios.get<CompanyProfile[]>(`${API_BASE}/company-profiles/by-company/${companyId}`),
  create: (data: CreateCompanyProfileRequest) => axios.post(`${API_BASE}/company-profiles`, data)
};

export const templatesApi = {
  getAll: () => axios.get<GlobalTemplate[]>(`${API_BASE}/global-templates`),
  getById: (id: number) => axios.get<GlobalTemplate>(`${API_BASE}/global-templates/${id}`),
  getDetails: (id: number) => axios.get<TemplateDetailsResponse>(`${API_BASE}/global-templates/${id}/details`),
  assignToCompany: (templateId: number, companyId: number, userId: number) =>
    axios.post(`${API_BASE}/global-templates/${templateId}/assign-to-company/${companyId}?userId=${userId}`)
};
