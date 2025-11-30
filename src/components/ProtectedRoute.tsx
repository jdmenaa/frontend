import { Navigate } from 'react-router-dom';
import { LoginResponse } from '../types';

interface ProtectedRouteProps {
  user: LoginResponse;
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ user, children, requireAdmin = false }: ProtectedRouteProps) {
  // Si la ruta requiere admin y el usuario no es admin, redirigir a inbox
  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/inbox" replace />;
  }

  return <>{children}</>;
}
