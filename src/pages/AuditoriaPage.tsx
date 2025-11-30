import { useState } from 'react';
import { Search, FileText, Download, Calendar } from 'lucide-react';

export default function AuditoriaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Datos de ejemplo
  const auditLogs = [
    {
      id: 1,
      fecha: '2025-11-29 10:30:15',
      usuario: 'Juan Pérez',
      accion: 'Aprobación',
      modulo: 'Workflow',
      detalle: 'Aprobó solicitud de compra #12345',
      estado: 'Exitoso',
      ip: '192.168.1.100'
    },
    {
      id: 2,
      fecha: '2025-11-29 09:15:22',
      usuario: 'María García',
      accion: 'Creación',
      modulo: 'Usuarios',
      detalle: 'Creó nuevo usuario: Carlos López',
      estado: 'Exitoso',
      ip: '192.168.1.105'
    },
    {
      id: 3,
      fecha: '2025-11-29 08:45:10',
      usuario: 'Admin System',
      accion: 'Modificación',
      modulo: 'Roles',
      detalle: 'Modificó permisos del rol Aprobador',
      estado: 'Exitoso',
      ip: '192.168.1.1'
    },
    {
      id: 4,
      fecha: '2025-11-28 16:20:33',
      usuario: 'Ana Martínez',
      accion: 'Rechazo',
      modulo: 'Workflow',
      detalle: 'Rechazó solicitud de viaje #45678',
      estado: 'Exitoso',
      ip: '192.168.1.110'
    },
    {
      id: 5,
      fecha: '2025-11-28 15:10:05',
      usuario: 'Carlos López',
      accion: 'Inicio Sesión',
      modulo: 'Autenticación',
      detalle: 'Inicio de sesión fallido - Contraseña incorrecta',
      estado: 'Error',
      ip: '192.168.1.120'
    },
    {
      id: 6,
      fecha: '2025-11-28 14:30:45',
      usuario: 'Juan Pérez',
      accion: 'Exportación',
      modulo: 'Reportes',
      detalle: 'Exportó reporte de aprobaciones mensual',
      estado: 'Exitoso',
      ip: '192.168.1.100'
    },
  ];

  const getEstadoBadge = (estado: string) => {
    if (estado === 'Exitoso') {
      return 'bg-green-100 text-green-800';
    }
    if (estado === 'Error') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Auditoría del Sistema</h1>
          <p className="text-gray-600 mt-1">Registro completo de acciones realizadas en el sistema</p>
        </div>
        <button className="btn-primary flex items-center space-x-2 flex-shrink-0">
          <Download className="w-5 h-5" />
          <span>Exportar Auditoría</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Total Registros</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>1,245</p>
            </div>
            <div className="p-1.5 rounded-lg" style={{backgroundColor: '#4c71fc'}}>
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Acciones Exitosas</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>1,198</p>
            </div>
            <div className="p-1.5 rounded-lg bg-green-500">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Acciones Fallidas</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>47</p>
            </div>
            <div className="p-1.5 rounded-lg bg-red-500">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Últimas 24h</p>
              <p className="text-xl font-bold mt-0.5" style={{color: '#4c71fc'}}>89</p>
            </div>
            <div className="p-1.5 rounded-lg bg-purple-500">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por usuario o acción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Fecha desde"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Fecha hasta"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los módulos</option>
            <option value="workflow">Workflow</option>
            <option value="usuarios">Usuarios</option>
            <option value="roles">Roles</option>
            <option value="auth">Autenticación</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Módulo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.fecha}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-semibold">
                        {log.usuario.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{log.usuario}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {log.modulo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.accion}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {log.detalle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(log.estado)}`}>
                      {log.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">1</span> a <span className="font-medium">6</span> de{' '}
            <span className="font-medium">1,245</span> registros
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Anterior
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              3
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
