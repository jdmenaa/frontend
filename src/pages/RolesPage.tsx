import { useEffect, useState } from 'react';
import { Plus, Shield, X, CheckSquare } from 'lucide-react';
import { companyRolesApi, globalOperationsApi } from '../api/access-management';
import type { CompanyRole, GlobalOperation } from '../types/access-management';
import type { LoginResponse } from '../types';

interface RolesPageProps {
  user: LoginResponse;
}

export default function RolesPage({ user }: RolesPageProps) {
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [operations, setOperations] = useState<GlobalOperation[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<CompanyRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    operationIds: [] as number[]
  });

  useEffect(() => {
    loadOperations();
    loadRoles();
  }, []);

  const loadOperations = async () => {
    try {
      const response = await globalOperationsApi.getAll();
      setOperations(response.data);
    } catch (error) {
      console.error('Error loading operations:', error);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await companyRolesApi.getByCompanyId(user.companyId);
      setRoles(response.data);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '', operationIds: [] });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await companyRolesApi.create({
        companyId: user.companyId,
        ...formData
      });
      setShowModal(false);
      loadRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Error al guardar el rol');
    }
  };

  const toggleOperation = (operationId: number) => {
    if (formData.operationIds.includes(operationId)) {
      setFormData({
        ...formData,
        operationIds: formData.operationIds.filter(id => id !== operationId)
      });
    } else {
      setFormData({
        ...formData,
        operationIds: [...formData.operationIds, operationId]
      });
    }
  };

  const groupedOperations = operations.reduce((acc, op) => {
    const moduleName = op.globalModuleName || 'Sin Módulo';
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(op);
    return acc;
  }, {} as Record<string, GlobalOperation[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Roles</h1>
          <p className="text-gray-600 mt-1">Define roles y asigna operaciones del sistema</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center space-x-2 flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Rol</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Total Roles</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>{roles.length}</p>
            </div>
            <div className="p-1.5 rounded-lg" style={{backgroundColor: '#4c71fc'}}>
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Roles Activos</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>
                {roles.filter(r => r.active).length}
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-green-500">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Total Operaciones</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>{operations.length}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-purple-500">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operaciones</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{role.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{role.description || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{role.operationsCount || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      role.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {role.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Rol *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Ej: Gerente de Área"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Operaciones * ({formData.operationIds.length} seleccionadas)
                  </label>
                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
                    {Object.entries(groupedOperations).map(([moduleName, ops]) => (
                      <div key={moduleName} className="space-y-2">
                        <h4 className="font-semibold text-gray-900 text-sm flex items-center">
                          <Shield className="w-4 h-4 mr-2" style={{color: '#4c71fc'}} />
                          {moduleName}
                        </h4>
                        <div className="ml-6 space-y-1">
                          {ops.map((op) => (
                            <label
                              key={op.id}
                              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.operationIds.includes(op.id)}
                                onChange={() => toggleOperation(op.id)}
                                className="w-4 h-4 rounded focus:ring-2"
                                style={{accentColor: '#4c71fc'}}
                              />
                              <span className="text-sm text-gray-700">{op.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t bg-gray-50 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formData.operationIds.length === 0}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  style={{backgroundColor: '#4c71fc'}}
                >
                  {editingRole ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
