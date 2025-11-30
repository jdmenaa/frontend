import { useEffect, useState } from 'react';
import { Plus, UserCircle, X, Shield } from 'lucide-react';
import { companyProfilesApi, companyRolesApi } from '../api/access-management';
import type { CompanyProfile, CompanyRole } from '../types/access-management';
import type { LoginResponse } from '../types';

interface PerfilesPageProps {
  user: LoginResponse;
}

export default function PerfilesPage({ user }: PerfilesPageProps) {
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CompanyProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    roleIds: [] as number[]
  });

  useEffect(() => {
    loadRoles();
    loadProfiles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await companyRolesApi.getByCompanyId(user.companyId);
      setRoles(response.data);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadProfiles = async () => {
    try {
      const response = await companyProfilesApi.getByCompanyId(user.companyId);
      setProfiles(response.data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const openCreateModal = () => {
    setEditingProfile(null);
    setFormData({ name: '', description: '', roleIds: [] });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await companyProfilesApi.create({
        companyId: user.companyId,
        ...formData
      });
      setShowModal(false);
      loadProfiles();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error al guardar el perfil');
    }
  };

  const toggleRole = (roleId: number) => {
    if (formData.roleIds.includes(roleId)) {
      setFormData({
        ...formData,
        roleIds: formData.roleIds.filter(id => id !== roleId)
      });
    } else {
      setFormData({
        ...formData,
        roleIds: [...formData.roleIds, roleId]
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Perfiles</h1>
          <p className="text-gray-600 mt-1">Configura perfiles de acceso agrupando roles</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center space-x-2 flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Perfil</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Total Perfiles</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>{profiles.length}</p>
            </div>
            <div className="p-1.5 rounded-lg" style={{backgroundColor: '#4c71fc'}}>
              <UserCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Perfiles Activos</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>
                {profiles.filter(p => p.active).length}
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-green-500">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Total Usuarios</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>
                {profiles.reduce((sum, p) => sum + (p.usersCount || 0), 0)}
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-purple-500">
              <UserCircle className="w-5 h-5 text-white" />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuarios</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{profile.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{profile.description || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{profile.rolesCount || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{profile.usersCount || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      profile.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.active ? 'Activo' : 'Inactivo'}
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingProfile ? 'Editar Perfil' : 'Nuevo Perfil'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Perfil *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Ej: Perfil Financiero"
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
                    Roles * ({formData.roleIds.length} seleccionados)
                  </label>
                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
                    {roles.map((role) => (
                      <label
                        key={role.id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded cursor-pointer border border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={formData.roleIds.includes(role.id)}
                          onChange={() => toggleRole(role.id)}
                          className="w-4 h-4 rounded focus:ring-2"
                          style={{accentColor: '#4c71fc'}}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4" style={{color: '#4c71fc'}} />
                            <span className="font-medium text-gray-900">{role.name}</span>
                          </div>
                          {role.description && (
                            <p className="text-xs text-gray-500 mt-1 ml-6">{role.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1 ml-6">
                            {role.operationsCount || 0} operaciones
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {roles.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No hay roles disponibles. Por favor cree roles primero.
                    </p>
                  )}
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
                  disabled={formData.roleIds.length === 0}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  style={{backgroundColor: '#4c71fc'}}
                >
                  {editingProfile ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
