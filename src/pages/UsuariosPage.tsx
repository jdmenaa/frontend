import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Users as UsersIcon } from 'lucide-react';
import axios from 'axios';
import type { LoginResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface Usuario {
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

interface UsuariosPageProps {
  user: LoginResponse;
}

interface CompanyProfile {
  id: number;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  companyId: number;
}

export default function UsuariosPage({ user }: UsuariosPageProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    position: '',
    active: true,
    profileIds: [] as number[]
  });

  useEffect(() => {
    loadUsuarios();
    loadProfiles();
  }, [user.companyId]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/users/company/${user.companyId}`);
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error loading usuarios:', error);
      alert('Error al cargar usuarios. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
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

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      password: '',
      position: '',
      active: true,
      profileIds: []
    });
    setShowModal(true);
  };

  const openEditModal = async (usuario: Usuario) => {
    setEditingUser(usuario);

    // Load user's profiles
    let userProfileIds: number[] = [];
    try {
      const response = await axios.get(`${API_BASE}/users/${usuario.id}/profiles`);
      userProfileIds = response.data;
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }

    setFormData({
      username: usuario.username,
      fullName: usuario.fullName,
      email: usuario.email,
      phone: usuario.phone || '',
      password: '',
      position: usuario.position || '',
      active: usuario.active,
      profileIds: userProfileIds
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userData = {
        ...formData,
        companyId: user.companyId
      };

      if (editingUser) {
        await axios.put(`${API_BASE}/users/${editingUser.id}`, userData);
      } else {
        await axios.post(`${API_BASE}/users`, userData);
      }

      setShowModal(false);
      loadUsuarios();
    } catch (error: any) {
      console.error('Error saving user:', error);

      // Mostrar mensaje específico del servidor si está disponible
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else if (error.response?.status === 409) {
        alert('El usuario ya existe. Por favor verifica el nombre de usuario y el email.');
      } else {
        alert('Error al guardar usuario. Por favor intenta nuevamente.');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;

    try {
      await axios.delete(`${API_BASE}/users/${id}`);
      loadUsuarios();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar usuario');
    }
  };

  const filteredUsuarios = usuarios.filter(u =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra los usuarios de {user.companyName}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center space-x-2 flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Total Usuarios</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>{usuarios.length}</p>
            </div>
            <div className="p-1.5 rounded-lg" style={{backgroundColor: '#4c71fc'}}>
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Usuarios Activos</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>
                {usuarios.filter(u => u.active).length}
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-green-500">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Usuarios Inactivos</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>
                {usuarios.filter(u => !u.active).length}
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-red-500">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{usuario.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{usuario.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{usuario.username}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        usuario.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(usuario)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuario *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {editingUser ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                    </label>
                    <input
                      type="password"
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargo
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Perfiles *
                  </label>
                  <div className="border rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                    {profiles.filter(p => p.active).length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        No hay perfiles disponibles. Crea perfiles primero en la página de Perfiles.
                      </p>
                    ) : (
                      profiles.filter(p => p.active).map(profile => (
                        <label key={profile.id} className="flex items-center py-2 hover:bg-gray-100 px-2 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.profileIds.includes(profile.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, profileIds: [...formData.profileIds, profile.id] });
                              } else {
                                setFormData({ ...formData, profileIds: formData.profileIds.filter(id => id !== profile.id) });
                              }
                            }}
                            className="mr-3 h-4 w-4 text-blue-600"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                            <div className="text-xs text-gray-500">{profile.code}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Los perfiles determinan los permisos del usuario. Selecciona al menos uno.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.active ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Empresa:</strong> {user.companyName}
                  </p>
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
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90"
                  style={{backgroundColor: '#4c71fc'}}
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
