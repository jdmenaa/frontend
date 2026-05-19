import { ReactNode } from 'react';
import { LogOut, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import { LoginResponse } from '../types';

interface LayoutProps {
  user: LoginResponse;
  onLogout: () => void;
  children: ReactNode;
}

export default function Layout({ user, onLogout, children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-14 fixed top-0 right-0 left-0 lg:left-64 z-50">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-800 hidden md:block">
                Bienvenido, {user.fullName}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="relative p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Info */}
              <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-gray-300">
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{backgroundColor: '#4c71fc'}}>
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8" style={{paddingTop: '6rem'}}>
          {children}
        </main>
      </div>
    </div>
  );
}
