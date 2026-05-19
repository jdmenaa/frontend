import { useEffect, useState } from 'react';
import { Package, CheckCircle, Download, Eye, X } from 'lucide-react';
import { templatesApi } from '../api/access-management';
import type { GlobalTemplate, TemplateDetailsResponse } from '../types/access-management';
import type { LoginResponse } from '../types';

interface PlantillasPageProps {
  user: LoginResponse;
}

export default function PlantillasPage({ user }: PlantillasPageProps) {
  const [templates, setTemplates] = useState<GlobalTemplate[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<GlobalTemplate | null>(null);
  const [templateDetails, setTemplateDetails] = useState<TemplateDetailsResponse | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    try {
      const response = await templatesApi.getAll();
      console.log('Plantillas cargadas:', response.data);
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
      alert('Error al cargar plantillas. Verifica que el backend esté corriendo en http://localhost:8080');
    }
  };

  const viewTemplateDetails = async (template: GlobalTemplate) => {
    try {
      setSelectedTemplate(template);
      const response = await templatesApi.getDetails(template.id);
      console.log('Detalles de plantilla:', response.data);
      setTemplateDetails(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error loading template details:', error);
      alert('Error al cargar los detalles de la plantilla');
    }
  };

  const assignTemplateToCompany = async () => {
    if (!selectedTemplate) return;

    if (!confirm(`¿Está seguro de asignar la plantilla "${selectedTemplate.name}" a su empresa? Esto copiará todos los módulos y operaciones.`)) {
      return;
    }

    try {
      setAssigning(true);
      await templatesApi.assignToCompany(selectedTemplate.id, user.companyId, user.userId);
      alert('Plantilla asignada exitosamente a su empresa');
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error assigning template:', error);
      alert('Error al asignar la plantilla');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Plantillas de Acceso</h1>
          <p className="text-gray-600 mt-1">Asigne plantillas predefinidas de módulos y operaciones a su empresa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Total Plantillas</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>{templates.length}</p>
            </div>
            <div className="p-1.5 rounded-lg" style={{backgroundColor: '#4c71fc'}}>
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{backgroundColor: '#E8F0FE'}}>
                  <Package className="w-5 h-5" style={{color: '#4c71fc'}} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{template.name}</h3>
                  <p className="text-xs text-gray-500">{template.code}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                template.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {template.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description || 'Sin descripción'}</p>

            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Operaciones incluidas:</span>
                <span className="font-semibold" style={{color: '#4c71fc'}}>{template.operationCount || 0}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => viewTemplateDetails(template)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Ver Detalles</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showDetailsModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h3>
                <p className="text-sm text-gray-500">{selectedTemplate.code}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-gray-700 mb-4">{selectedTemplate.description}</p>

              <h4 className="font-bold text-gray-900 mb-3">Módulos y Operaciones Incluidas:</h4>

              {templateDetails && (
                <div className="space-y-3">
                  {Object.entries(
                    templateDetails.operations.reduce((acc, detail) => {
                      if (!acc[detail.moduleName]) {
                        acc[detail.moduleName] = [];
                      }
                      acc[detail.moduleName].push(detail);
                      return acc;
                    }, {} as Record<string, typeof templateDetails.operations>)
                  ).map(([moduleName, operations]) => (
                    <div key={moduleName} className="border rounded-lg p-3 bg-gray-50">
                      <div className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Package className="w-4 h-4 mr-2" style={{color: '#4c71fc'}} />
                        {moduleName}
                        <span className="ml-2 text-xs text-gray-500">({operations.length} operaciones)</span>
                      </div>
                      <ul className="space-y-1 ml-6">
                        {operations.map((op) => (
                          <li key={op.operationId} className="text-sm text-gray-600 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
                            {op.operationName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Esta plantilla se asignará a: <span className="font-semibold">{user.companyName}</span>
              </p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                  disabled={assigning}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={assignTemplateToCompany}
                  disabled={assigning}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 flex items-center space-x-2 disabled:opacity-50"
                  style={{backgroundColor: '#4c71fc'}}
                >
                  <Download className="w-4 h-4" />
                  <span>{assigning ? 'Asignando...' : 'Asignar a mi Empresa'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
