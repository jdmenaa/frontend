import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, AlertCircle, CheckCircle, FileText, DollarSign, MessageSquare } from 'lucide-react';
import { LoginResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface Workflow {
  id: number;
  name: string;
  description: string;
  operationType: string;
  active: boolean;
}

interface NewRequestPageProps {
  user: LoginResponse;
}

export default function NewRequestPage({ user }: NewRequestPageProps) {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [requestType, setRequestType] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    // Validar que el usuario tenga rol ADMIN
    if (user.role !== 'ADMIN') {
      setError('No tienes permisos para iniciar solicitudes. Solo los administradores pueden crear solicitudes de aprobación.');
      setLoading(false);
      return;
    }
    loadWorkflows();
  }, [user.role]);

  const loadWorkflows = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/workflows/company/${user.companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar flujos');
      }

      const data = await response.json();
      const activeWorkflows = data.filter((w: Workflow) => w.active);
      setWorkflows(activeWorkflows);
    } catch (err) {
      console.error('Error loading workflows:', err);
      setError('Error al cargar los flujos disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!selectedWorkflow) {
      setError('Debe seleccionar un flujo');
      setSubmitting(false);
      return;
    }

    if (!requestType.trim()) {
      setError('Debe especificar el tipo de solicitud');
      setSubmitting(false);
      return;
    }

    if (!description.trim()) {
      setError('Debe proporcionar una descripción');
      setSubmitting(false);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Debe especificar un monto válido');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/workflows/${selectedWorkflow}/instances?userId=${user.userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requestType: requestType.trim(),
            description: description.trim(),
            amount: parseFloat(amount)
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al crear la solicitud');
      }

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/inbox');
      }, 2000);

    } catch (err: any) {
      console.error('Error creating request:', err);
      setError(err.message || 'Error al enviar la solicitud. Por favor intente nuevamente.');
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedWorkflow(null);
    setRequestType('');
    setDescription('');
    setAmount('');
    setError(null);
    setSuccess(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            ¡Solicitud Enviada Exitosamente!
          </h2>
          <p className="text-green-700 mb-4">
            Su solicitud ha sido enviada y está en proceso de aprobación.
          </p>
          <p className="text-sm text-green-600">
            Redirigiendo a la bandeja de entrada...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nueva Solicitud</h1>
        <p className="text-gray-600">
          Complete el formulario para enviar una nueva solicitud de aprobación
        </p>
      </div>

      {workflows.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            No hay flujos disponibles
          </h3>
          <p className="text-yellow-700">
            No tiene flujos activos configurados para crear solicitudes.
            Contacte al administrador.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Workflow Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              1. Seleccione el Flujo de Aprobación *
            </label>
            <div className="space-y-3">
              {workflows.map((workflow) => (
                <button
                  key={workflow.id}
                  type="button"
                  onClick={() => setSelectedWorkflow(workflow.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedWorkflow === workflow.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {workflow.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {workflow.description}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {workflow.operationType}
                      </span>
                    </div>
                    {selectedWorkflow === workflow.id && (
                      <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              2. Detalles de la Solicitud
            </h2>

            {/* Request Type */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                Tipo de Solicitud *
              </label>
              <input
                type="text"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="Ej: Pago de Nómina, Transferencia, Compra de Activo"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 mr-2" />
                Monto *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 mr-2" />
                Descripción *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                placeholder="Proporcione una descripción detallada de la solicitud..."
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                {description.length} caracteres
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedWorkflow}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Solicitud</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
