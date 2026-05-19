export interface GlobalModule {
  id: number;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  operationsCount?: number;
}

export interface GlobalOperation {
  id: number;
  code: string;
  name: string;
  description?: string;
  globalModuleId: number;
  globalModuleName: string;
  active: boolean;
  createdAt: string;
}

export interface CompanyRole {
  id: number;
  companyId: number;
  name: string;
  description?: string;
  active: boolean;
  operationsCount?: number;
  createdAt: string;
}

export interface CompanyProfile {
  id: number;
  companyId: number;
  name: string;
  description?: string;
  active: boolean;
  rolesCount?: number;
  usersCount?: number;
  createdAt: string;
}

export interface CreateGlobalModuleRequest {
  code: string;
  name: string;
  description?: string;
  active?: boolean;
}

export interface CreateCompanyRoleRequest {
  companyId: number;
  name: string;
  description?: string;
  operationIds: number[];
}

export interface CreateCompanyProfileRequest {
  companyId: number;
  name: string;
  description?: string;
  roleIds: number[];
}

export interface GlobalTemplate {
  id: number;
  code: string;
  name: string;
  description?: string;
  operationCount?: number;
  operationsByModule?: Record<string, number>;
  active?: boolean;
}

export interface GlobalTemplateDetail {
  operationId: number;
  operationCode: string;
  operationName: string;
  moduleName: string;
  moduleCode: string;
}

export interface TemplateDetailsResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  operations: GlobalTemplateDetail[];
}
