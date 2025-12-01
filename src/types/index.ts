// Estados de tareas de aprobación
export enum TaskStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

// Estados de instancias de workflow
export enum WorkflowStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  position?: string;
  active: boolean;
  companyId: number;
}

export interface LoginResponse {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  companyId: number;
  companyName: string;
  token: string;
}

export interface WorkflowNode {
  id?: number;
  nodeId: string;
  nodeType: 'START' | 'EXECUTOR' | 'APPROVER' | 'RULE' | 'END';
  sequence: number;
  assignmentType?: 'USER' | 'PROFILE' | 'ROLE';
  assignedUserId?: number;
  assignedUserName?: string;
  profileId?: number;
  roleId?: number;
  timeLimitHours?: number;
  notifyEmail?: boolean;
  notifySms?: boolean;
  notifyApp?: boolean;
  approvalType?: string;
  ruleExpression?: string;
  properties?: string;
}

export interface WorkflowDefinition {
  id?: number;
  name: string;
  description?: string;
  operationType: string;
  active: boolean;
  nodes: WorkflowNode[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowInstance {
  id?: number;
  workflowDefinitionId: number;
  workflowName?: string;
  status: string;
  requestType: string;
  description?: string;
  amount?: number;
  requestData?: string;
  initiatedById?: number;
  initiatedByName?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface ApprovalTask {
  id: number;
  workflowInstanceId: number;
  workflowName: string;
  requestType: string;
  description?: string;
  amount?: number;
  status: string;
  sequence: number;
  comments?: string;
  dueDate: string;
  isUrgent: boolean;
  createdAt: string;
  initiatedByName: string;
  companyName: string;
}

export interface DraggableComponent {
  id: string;
  type: 'EXECUTOR' | 'APPROVER' | 'RULE';
  label: string;
  icon: string;
}

export interface CompanyProfile {
  id: number;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  companyId: number;
}

export interface CompanyRole {
  id: number;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  companyId: number;
}
