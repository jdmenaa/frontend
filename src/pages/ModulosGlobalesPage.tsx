import { useEffect, useState } from 'react';
import { Plus, X, Package } from 'lucide-react';
import { globalModulesApi } from '../api/access-management';
import type { GlobalModule, CreateGlobalModuleRequest } from '../types/access-management';

export default function ModulosGlobalesPage() {
  const [modules, setModules] = useState<GlobalModule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState<GlobalModule | null>(null);
  const [formData, setFormData] = useState<CreateGlobalModuleRequest>({
    code: '', name: '', description: '', active: true
  });

  useEffect(() => { loadModules(); }, []);

  const loadModules = async () => {
    try {
      const response = await globalModulesApi.getAll();
      setModules(response.data);
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  const openCreateModal = () => {
    setEditingModule(null);
    setFormData({ code: '', name: '', description: '', active: true });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingModule) {
        await globalModulesApi.update(editingModule.id, formData);
      } else {
        await globalModulesApi.create(formData);
      }
      setShowModal(false);
      loadModules();
    } catch (error) {
      alert('Error al guardar el módulo');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Módulos Globales</h1>
          <p className="text-gray-600 mt-1">Catálogo global de módulos del sistema</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center space-x-2 flex-shrink-0">
          <Plus className="w-5 h-5" />
          <span>Nuevo Módulo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Total Módulos</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>{modules.length}</p>
            </div>
            <div className="p-1.5 rounded-lg" style={{backgroundColor: '#4c71fc'}}>
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modules.map((module) => (
                <tr key={module.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{module.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{module.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{module.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      module.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {module.active ? 'Activo' : 'Inactivo'}
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="MOD_WORKFLOW"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
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

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingModule ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
