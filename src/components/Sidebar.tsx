import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  Shield,
  UserCircle,
  GitBranch,
  Inbox,
  FileText,
  ChevronDown,
  ChevronRight,
  Building2,
  Menu,
  X,
  Package,
  FileStack,
  Send
} from 'lucide-react';
import { LoginResponse } from '../types';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  adminOnly?: boolean;
  executorOnly?: boolean;
}

interface SidebarProps {
  user: LoginResponse;
}

const menuItems: MenuItem[] = [
  {
    id: 'auto-gestion',
    label: 'Auto-Gestión',
    icon: <UserCircle className="w-5 h-5" />,
    adminOnly: true,
    children: [
      {
        id: 'usuarios',
        label: 'Usuarios',
        icon: <Users className="w-4 h-4" />,
        path: '/usuarios',
        adminOnly: true
      },
      {
        id: 'roles',
        label: 'Roles',
        icon: <Shield className="w-4 h-4" />,
        path: '/roles',
        adminOnly: true
      },
      {
        id: 'perfiles',
        label: 'Perfiles',
        icon: <UserCircle className="w-4 h-4" />,
        path: '/perfiles',
        adminOnly: true
      },
      {
        id: 'modulos-globales',
        label: 'Módulos Globales',
        icon: <Package className="w-4 h-4" />,
        path: '/modulos-globales',
        adminOnly: true
      },
      {
        id: 'plantillas',
        label: 'Plantillas',
        icon: <FileStack className="w-4 h-4" />,
        path: '/plantillas',
        adminOnly: true
      }
    ]
  },
  {
    id: 'workflow',
    label: 'Workflow-Aprobaciones',
    icon: <GitBranch className="w-5 h-5" />,
    children: [
      {
        id: 'configuracion-flujos',
        label: 'Configuración Flujos',
        icon: <GitBranch className="w-4 h-4" />,
        path: '/workflows',
        adminOnly: true
      },
      {
        id: 'nueva-solicitud',
        label: 'Nueva Solicitud',
        icon: <Send className="w-4 h-4" />,
        path: '/new-request',
        executorOnly: true
      },
      {
        id: 'bandeja-entrada',
        label: 'Bandeja de Entrada',
        icon: <Inbox className="w-4 h-4" />,
        path: '/inbox'
      },
      {
        id: 'auditoria',
        label: 'Auditoría',
        icon: <FileText className="w-4 h-4" />,
        path: '/auditoria',
        adminOnly: true
      }
    ]
  }
];

export default function Sidebar({ user }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['auto-gestion', 'workflow']);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAdmin = user.role === 'ADMIN';
  const isExecutor = user.role === 'EXECUTOR';

  // Debug: Verificar el rol del usuario
  console.log('=== SIDEBAR DEBUG ===');
  console.log('Usuario:', user.username);
  console.log('Role:', user.role);
  console.log('Is Admin:', isAdmin);
  console.log('Is Executor:', isExecutor);

  // Filtrar menú según el rol del usuario
  const filteredMenuItems = menuItems.map(item => {
    // Si el item principal es adminOnly y el usuario no es admin, no mostrarlo
    if (item.adminOnly && !isAdmin) {
      console.log(`Ocultando menú principal: ${item.label} (adminOnly)`);
      return null;
    }

    // Filtrar los children si existen
    if (item.children) {
      const filteredChildren = item.children.filter(child => {
        // Validar adminOnly
        if (child.adminOnly && !isAdmin) {
          console.log(`Ocultando submenú: ${child.label} (adminOnly)`);
          return false;
        }
        // Validar executorOnly
        if (child.executorOnly && !isExecutor && !isAdmin) {
          console.log(`Ocultando submenú: ${child.label} (executorOnly)`);
          return false;
        }
        return true;
      });

      // Si no quedan children después del filtro, no mostrar el parent
      if (filteredChildren.length === 0) {
        console.log(`Ocultando menú principal: ${item.label} (sin hijos visibles)`);
        return null;
      }

      return { ...item, children: filteredChildren };
    }

    return item;
  }).filter(item => item !== null) as MenuItem[];

  console.log('Menús visibles:', filteredMenuItems.map(m => ({
    label: m.label,
    children: m.children?.map(c => c.label)
  })));

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg" style={{backgroundColor: '#4c71fc'}}>
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">DCE Workflow</h1>
            <p className="text-gray-400 text-xs truncate">{user.companyName}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {filteredMenuItems.map((item) => (
            <div key={item.id}>
              {/* Parent Menu Item */}
              <button
                onClick={() => item.children ? toggleMenu(item.id) : item.path && handleNavigation(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                style={isActive(item.path) ? {backgroundColor: '#4c71fc'} : {}}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.children && (
                  expandedMenus.includes(item.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )
                )}
              </button>

              {/* Children Menu Items */}
              {item.children && expandedMenus.includes(item.id) && (
                <div className="mt-1 ml-4 space-y-1">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => child.path && handleNavigation(child.path)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive(child.path)
                          ? 'text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                      style={isActive(child.path) ? {backgroundColor: '#4c71fc'} : {}}
                    >
                      {child.icon}
                      <span>{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          <p>Portal Enterprise</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 text-white rounded-lg shadow-lg bg-gray-900"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed left-0 top-0 shadow-xl z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Sidebar */}
          <aside className="lg:hidden fixed left-0 top-0 w-64 h-screen shadow-xl z-50 transform transition-transform">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
