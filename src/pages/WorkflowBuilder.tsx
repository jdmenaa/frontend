import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, LogOut, ArrowLeft, Save, User, CheckCircle, Zap, Trash2 } from 'lucide-react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LoginResponse, WorkflowNode, WorkflowDefinition, User as UserType, CompanyProfile, CompanyRole } from '../types';
import { workflowApi, userApi } from '../api/workflows';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface WorkflowBuilderProps {
  user: LoginResponse;
  onLogout: () => void;
}

const COMPONENT_TYPES = [
  { type: 'EXECUTOR', label: 'Ejecutor', icon: User, color: 'bg-blue-500' },
  { type: 'APPROVER', label: 'Aprobador', icon: CheckCircle, color: 'bg-green-500' },
  { type: 'RULE', label: 'Regla', icon: Zap, color: 'bg-yellow-500' },
];

interface SortableNodeProps {
  node: WorkflowNode;
  index: number;
  onEdit: (node: WorkflowNode) => void;
  onDelete: (index: number) => void;
  users: UserType[];
  profiles: CompanyProfile[];
  roles: CompanyRole[];
}

function SortableNode({ node, index, onEdit, onDelete, users, profiles, roles }: SortableNodeProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: node.nodeId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getNodeColor = () => {
    switch (node.nodeType) {
      case 'EXECUTOR':
        return 'bg-blue-50 border-blue-300';
      case 'APPROVER':
        return 'bg-green-50 border-green-300';
      case 'RULE':
        return 'bg-yellow-50 border-yellow-300';
      default:
        return 'bg-gray-50 border-gray-300';
    }
  };

  const getIcon = () => {
    switch (node.nodeType) {
      case 'EXECUTOR':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'APPROVER':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'RULE':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getAssignmentLabel = () => {
    if (node.assignmentType === 'PROFILE' && node.profileId) {
      const profile = profiles.find(p => p.id === node.profileId);
      return profile ? `Perfil: ${profile.name}` : 'Sin asignar';
    } else if (node.assignmentType === 'ROLE' && node.roleId) {
      const role = roles.find(r => r.id === node.roleId);
      return role ? `Rol: ${role.name}` : 'Sin asignar';
    } else if (node.assignedUserId) {
      const user = users.find(u => u.id === node.assignedUserId);
      return user ? user.fullName : 'Sin asignar';
    }
    return 'Sin asignar';
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className={`border-2 rounded-lg p-4 mb-3 cursor-move ${getNodeColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">{getIcon()}</div>
            <div>
              <div className="font-medium text-gray-900">
                [{index + 1}] {node.nodeType === 'RULE' ? 'Regla de Negocio' : getAssignmentLabel()}
              </div>
              {node.nodeType === 'RULE' && node.ruleExpression && (
                <div className="text-sm text-gray-600 mt-1">
                  Condición: {node.ruleExpression}
                </div>
              )}
              {node.timeLimitHours && (
                <div className="text-sm text-gray-600 mt-1">
                  Tiempo límite: {node.timeLimitHours}h
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node);
              }}
              className="p-2 text-primary-600 hover:bg-primary-100 rounded transition-colors"
            >
              Editar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
              }}
              className="p-2 text-danger hover:bg-red-100 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowBuilder({ user, onLogout }: WorkflowBuilderProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [operationType, setOperationType] = useState('PAYMENT');
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [editingNode, setEditingNode] = useState<WorkflowNode | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadUsers();
    loadProfiles();
    loadRoles();
    if (id) {
      loadWorkflow();
    }
  }, [id]);

  const loadUsers = async () => {
    try {
      const data = await userApi.getByCompany(user.companyId);
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadProfiles = async () => {
    try {
      const response = await axios.get(`${API_BASE}/company-profiles/by-company/${user.companyId}`);
      setProfiles(response.data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await axios.get(`${API_BASE}/company-roles/by-company/${user.companyId}`);
      setRoles(response.data);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadWorkflow = async () => {
    if (!id) return;
    try {
      const workflow = await workflowApi.getById(parseInt(id));
      setName(workflow.name);
      setDescription(workflow.description || '');
      setOperationType(workflow.operationType);
      setNodes(workflow.nodes || []);
    } catch (error) {
      console.error('Error loading workflow:', error);
    }
  };

  const addNode = (type: 'EXECUTOR' | 'APPROVER' | 'RULE') => {
    const newNode: WorkflowNode = {
      nodeId: `node_${Date.now()}`,
      nodeType: type,
      sequence: nodes.length,
      assignmentType: 'USER',
      timeLimitHours: 48,
      notifyEmail: true,
      notifySms: false,
      notifyApp: false,
    };
    setEditingNode(newNode);
    setEditingIndex(null);
    setShowNodeEditor(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setNodes((items) => {
        const oldIndex = items.findIndex((item) => item.nodeId === active.id);
        const newIndex = items.findIndex((item) => item.nodeId === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, sequence: index }));
      });
    }
  };

  const handleEditNode = (node: WorkflowNode) => {
    setEditingNode({ ...node });
    setEditingIndex(nodes.findIndex((n) => n.nodeId === node.nodeId));
    setShowNodeEditor(true);
  };

  const handleDeleteNode = (index: number) => {
    setNodes(nodes.filter((_, i) => i !== index).map((n, i) => ({ ...n, sequence: i })));
  };

  const handleSaveNode = () => {
    if (!editingNode) return;

    if (editingIndex !== null) {
      const updatedNodes = [...nodes];
      updatedNodes[editingIndex] = editingNode;
      setNodes(updatedNodes);
    } else {
      setNodes([...nodes, { ...editingNode, sequence: nodes.length }]);
    }

    setShowNodeEditor(false);
    setEditingNode(null);
    setEditingIndex(null);
  };

  const handleSaveWorkflow = async () => {
    if (!name.trim()) {
      alert('Por favor ingrese un nombre para el flujo');
      return;
    }

    if (nodes.length === 0) {
      alert('Por favor agregue al menos un nodo al flujo');
      return;
    }

    setLoading(true);
    try {
      const workflow: WorkflowDefinition = {
        name,
        description,
        operationType,
        active: true,
        nodes,
      };

      if (id) {
        await workflowApi.update(parseInt(id), workflow);
      } else {
        await workflowApi.create(user.companyId, workflow);
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error al guardar el flujo. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <Building2 className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Constructor de Flujos</h1>
                <p className="text-xs text-gray-500">Arrastra y suelta los componentes</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleSaveWorkflow}
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Guardando...' : 'Guardar Flujo'}</span>
              </button>

              <button onClick={onLogout} className="p-2 text-gray-600 hover:text-danger transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Components */}
          <div className="col-span-3">
            <div className="card sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Componentes</h3>
              <p className="text-sm text-gray-600 mb-4">Disponibles:</p>

              <div className="space-y-3">
                {COMPONENT_TYPES.map((component) => {
                  const Icon = component.icon;
                  return (
                    <button
                      key={component.type}
                      onClick={() => addNode(component.type as any)}
                      className="w-full flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                    >
                      <div className={`${component.color} p-2 rounded`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{component.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center Panel - Canvas */}
          <div className="col-span-6">
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Canvas Principal</h3>

              {/* Workflow Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Flujo *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    placeholder="Ej: Pago de Nómina"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input"
                    rows={2}
                    placeholder="Descripción del flujo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Operación *
                  </label>
                  <select
                    value={operationType}
                    onChange={(e) => setOperationType(e.target.value)}
                    className="input"
                  >
                    <option value="PAYMENT">Pago</option>
                    <option value="TRANSFER">Transferencia</option>
                    <option value="PAYROLL">Nómina</option>
                    <option value="INVOICE">Factura</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
              </div>

              {/* Flow Diagram */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 min-h-[400px]">
                <div className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full mx-auto mb-4">
                  <span className="font-bold">INICIO</span>
                </div>

                <div className="flex justify-center mb-4">
                  <div className="w-0.5 h-8 bg-gray-400"></div>
                </div>

                {nodes.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-2">El flujo está vacío</p>
                    <p className="text-sm text-gray-400">
                      Agrega componentes desde el panel izquierdo
                    </p>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={nodes.map((n) => n.nodeId)} strategy={verticalListSortingStrategy}>
                      {nodes.map((node, index) => (
                        <div key={node.nodeId}>
                          <SortableNode
                            node={node}
                            index={index}
                            onEdit={handleEditNode}
                            onDelete={handleDeleteNode}
                            users={users}
                            profiles={profiles}
                            roles={roles}
                          />
                          {index < nodes.length - 1 && (
                            <div className="flex justify-center mb-3">
                              <div className="w-0.5 h-8 bg-gray-400"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </SortableContext>
                  </DndContext>
                )}

                {nodes.length > 0 && (
                  <>
                    <div className="flex justify-center mb-4">
                      <div className="w-0.5 h-8 bg-gray-400"></div>
                    </div>

                    <div className="flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-full mx-auto">
                      <span className="font-bold text-xs">FIN</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Properties */}
          <div className="col-span-3">
            <div className="card sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Propiedades del Flujo</h3>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nombre:</span>
                  <p className="text-gray-600">{name || 'Sin nombre'}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Operación:</span>
                  <p className="text-gray-600">{operationType}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Empresa:</span>
                  <p className="text-gray-600">{user.companyName}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Nodos configurados:</span>
                  <p className="text-gray-600">{nodes.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Node Editor Modal */}
      {showNodeEditor && editingNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Configurar {editingNode.nodeType === 'RULE' ? 'Regla' : 'Nodo'}
            </h3>

            <div className="space-y-4">
              {editingNode.nodeType !== 'RULE' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Asignación *
                    </label>
                    <select
                      value={editingNode.assignmentType || 'USER'}
                      onChange={(e) => {
                        const newType = e.target.value as 'USER' | 'PROFILE' | 'ROLE';
                        setEditingNode({
                          ...editingNode,
                          assignmentType: newType,
                          assignedUserId: undefined,
                          profileId: undefined,
                          roleId: undefined
                        });
                      }}
                      className="input"
                    >
                      <option value="USER">Usuario</option>
                      <option value="PROFILE">Perfil</option>
                      <option value="ROLE">Rol</option>
                    </select>
                  </div>

                  {editingNode.assignmentType === 'USER' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usuario Asignado *
                      </label>
                      <select
                        value={editingNode.assignedUserId || ''}
                        onChange={(e) =>
                          setEditingNode({ ...editingNode, assignedUserId: parseInt(e.target.value) })
                        }
                        className="input"
                      >
                        <option value="">Seleccionar usuario</option>
                        {users
                          .filter((u) =>
                            editingNode.nodeType === 'EXECUTOR'
                              ? u.role === 'EXECUTOR' || u.role === 'ADMIN'
                              : u.role === 'APPROVER' || u.role === 'ADMIN'
                          )
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.fullName} - {u.position}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {editingNode.assignmentType === 'PROFILE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Perfil Asignado *
                      </label>
                      <select
                        value={editingNode.profileId || ''}
                        onChange={(e) =>
                          setEditingNode({ ...editingNode, profileId: parseInt(e.target.value) })
                        }
                        className="input"
                      >
                        <option value="">Seleccionar perfil</option>
                        {profiles.filter(p => p.active).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.code})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        El sistema asignará automáticamente a los usuarios con este perfil
                      </p>
                    </div>
                  )}

                  {editingNode.assignmentType === 'ROLE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rol Asignado *
                      </label>
                      <select
                        value={editingNode.roleId || ''}
                        onChange={(e) =>
                          setEditingNode({ ...editingNode, roleId: parseInt(e.target.value) })
                        }
                        className="input"
                      >
                        <option value="">Seleccionar rol</option>
                        {roles.filter(r => r.active).map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.code})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        El sistema asignará automáticamente a los usuarios con este rol
                      </p>
                    </div>
                  )}
                </>
              )}

              {editingNode.nodeType === 'RULE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expresión de la Regla *
                  </label>
                  <input
                    type="text"
                    value={editingNode.ruleExpression || ''}
                    onChange={(e) =>
                      setEditingNode({ ...editingNode, ruleExpression: e.target.value })
                    }
                    className="input"
                    placeholder="Ej: amount > 5000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Variables disponibles: amount, requestType
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo Límite (horas)
                </label>
                <input
                  type="number"
                  value={editingNode.timeLimitHours || 48}
                  onChange={(e) =>
                    setEditingNode({ ...editingNode, timeLimitHours: parseInt(e.target.value) })
                  }
                  className="input"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notificaciones
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingNode.notifyEmail}
                      onChange={(e) =>
                        setEditingNode({ ...editingNode, notifyEmail: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingNode.notifySms}
                      onChange={(e) =>
                        setEditingNode({ ...editingNode, notifySms: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">SMS</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingNode.notifyApp}
                      onChange={(e) =>
                        setEditingNode({ ...editingNode, notifyApp: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">App</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowNodeEditor(false);
                  setEditingNode(null);
                  setEditingIndex(null);
                }}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button onClick={handleSaveNode} className="flex-1 btn-primary">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
