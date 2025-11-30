import { useEffect, useState } from 'react';
import { Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LoginResponse, ApprovalTask } from '../types';
import { taskApi } from '../api/tasks';

interface InboxProps {
  user: LoginResponse;
  onLogout: () => void;
}

export default function Inbox({ user }: InboxProps) {
  const [tasks, setTasks] = useState<ApprovalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<ApprovalTask | null>(null);
  const [comments, setComments] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await taskApi.getPending(user.userId);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (task: ApprovalTask, type: 'approve' | 'reject') => {
    setSelectedTask(task);
    setActionType(type);
    setComments('');
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selectedTask) return;

    setActionLoading(selectedTask.id);
    try {
      if (actionType === 'approve') {
        await taskApi.approve(selectedTask.id, comments);
      } else {
        await taskApi.reject(selectedTask.id, comments);
      }
      setShowModal(false);
      loadTasks();
    } catch (error) {
      console.error('Error processing task:', error);
      alert('Error al procesar la tarea. Por favor intente nuevamente.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 0) return 'Vencida';
    if (hours < 4) return `${hours}h restantes`;
    if (hours < 24) return `${hours}h restantes`;
    const days = Math.floor(hours / 24);
    return `${days}d restantes`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Bandeja de Aprobaciones</h1>
          <p className="text-gray-600 mt-1">Gestiona las solicitudes pendientes de aprobación</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Pendientes</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>
                {tasks.filter((t) => t.status === 'PENDING').length}
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-yellow-500">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Urgentes</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>
                {tasks.filter((t) => t.isUrgent).length}
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-red-500">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Total Tareas</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>{tasks.length}</p>
            </div>
            <div className="p-1.5 rounded-lg" style={{backgroundColor: '#4c71fc'}}>
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Pendientes ({tasks.filter((t) => t.status === 'PENDING').length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Cargando tareas...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No hay tareas pendientes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-6 transition-all ${
                    task.isUrgent
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {task.isUrgent && (
                          <AlertCircle className="w-5 h-5 text-danger" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {task.workflowName}
                        </h3>
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          {task.requestType}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4">{task.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>{task.amount ? formatCurrency(task.amount) : 'N/A'}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className={task.isUrgent ? 'text-danger font-medium' : ''}>
                            {getTimeRemaining(task.dueDate)}
                          </span>
                        </div>

                        <div className="text-gray-600">
                          <span className="font-medium">Solicitado por:</span>{' '}
                          {task.initiatedByName}
                        </div>

                        <div className="text-gray-600">
                          <span className="font-medium">Empresa:</span> {task.companyName}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      <button
                        onClick={() => openActionModal(task, 'approve')}
                        className="btn-success flex items-center space-x-2 min-w-[120px]"
                        disabled={actionLoading === task.id}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Aprobar</span>
                      </button>

                      <button
                        onClick={() => openActionModal(task, 'reject')}
                        className="btn-danger flex items-center space-x-2 min-w-[120px]"
                        disabled={actionLoading === task.id}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {actionType === 'approve' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
            </h3>

            <p className="text-gray-600 mb-6">
              {selectedTask.workflowName} - {selectedTask.description}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="Agregue comentarios (opcional)"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 btn-secondary"
                disabled={actionLoading !== null}
              >
                Cancelar
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                disabled={actionLoading !== null}
              >
                {actionLoading !== null ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
