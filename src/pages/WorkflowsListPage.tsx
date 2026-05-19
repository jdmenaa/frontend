import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, GitBranch, Edit, Trash2, Play, Pause, FileText } from 'lucide-react';
import { LoginResponse, WorkflowDefinition } from '../types';
import { workflowApi } from '../api/workflows';

interface WorkflowsListPageProps {
  user: LoginResponse;
}

export default function WorkflowsListPage({ user }: WorkflowsListPageProps) {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await workflowApi.getByCompany(user.companyId);
      setWorkflows(data);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Flujos</h1>
          <p className="text-gray-600 mt-1">Gestiona los flujos de aprobación de tu empresa</p>
        </div>
        <button
          onClick={() => navigate('/workflows/new')}
          className="btn-primary flex items-center space-x-2 flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Flujo</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Total Flujos</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>{workflows.length}</p>
            </div>
            <div className="p-1.5 rounded-lg" style={{backgroundColor: '#4c71fc'}}>
              <GitBranch className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Flujos Activos</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>
                {workflows.filter(w => w.active).length}
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-green-500">
              <Play className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Flujos Inactivos</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>
                {workflows.filter(w => !w.active).length}
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-gray-500">
              <Pause className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Total Pasos</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>
                {workflows.reduce((sum, w) => sum + (w.nodes?.length || 0), 0)}
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-purple-500">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Workflows Content */}
      {loading ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando flujos...</p>
          </div>
        </div>
      ) : workflows.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <GitBranch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No hay flujos de aprobación configurados</p>
            <button
              onClick={() => navigate('/workflows/new')}
              className="btn-primary"
            >
              Crear primer flujo
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="card hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => navigate(`/workflows/${workflow.id}/edit`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                    <GitBranch className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {workflow.name}
                    </h3>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    workflow.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {workflow.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {workflow.description}
              </p>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>{workflow.operationType}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitBranch className="w-4 h-4" />
                  <span>{workflow.nodes?.length || 0} pasos</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/workflows/${workflow.id}/edit`);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Delete', workflow.id);
                  }}
                  className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
