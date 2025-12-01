import { Navigate } from 'react-router-dom';
import { LoginResponse } from '../types';

interface ProtectedRouteProps {
  user: LoginResponse;
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireExecutor?: boolean;
}

export default function ProtectedRoute({ user, children, requireAdmin = false, requireExecutor = false }: ProtectedRouteProps) {
  // Si la ruta requiere admin y el usuario no es admin, redirigir a inbox
  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/inbox" replace />;
  }

  // Si la ruta requiere executor y el usuario no es executor ni admin, redirigir a inbox
  if (requireExecutor && user.role !== 'EXECUTOR' && user.role !== 'ADMIN') {
    return <Navigate to="/inbox" replace />;
  }

  return <>{children}</>;
}
