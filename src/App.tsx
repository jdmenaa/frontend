import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import WorkflowBuilder from './pages/WorkflowBuilder';
import WorkflowsListPage from './pages/WorkflowsListPage';
import Inbox from './pages/Inbox';
import NewRequestPage from './pages/NewRequestPage';
import UsuariosPage from './pages/UsuariosPage';
import RolesPage from './pages/RolesPage';
import PerfilesPage from './pages/PerfilesPage';
import AuditoriaPage from './pages/AuditoriaPage';
import ModulosGlobalesPage from './pages/ModulosGlobalesPage';
import PlantillasPage from './pages/PlantillasPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { LoginResponse } from './types';

function App() {
  const [user, setUser] = useState<LoginResponse | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: LoginResponse) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={user.role === 'ADMIN' ? "/workflows" : "/inbox"} replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* Auto-Gestión - ADMIN ONLY */}
        <Route
          path="/usuarios"
          element={
            user ? (
              <ProtectedRoute user={user} requireAdmin>
                <Layout user={user} onLogout={handleLogout}>
                  <UsuariosPage user={user} />
                </Layout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/roles"
          element={
            user ? (
              <ProtectedRoute user={user} requireAdmin>
                <Layout user={user} onLogout={handleLogout}>
                  <RolesPage user={user} />
                </Layout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/perfiles"
          element={
            user ? (
              <ProtectedRoute user={user} requireAdmin>
                <Layout user={user} onLogout={handleLogout}>
                  <PerfilesPage user={user} />
                </Layout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/modulos-globales"
          element={
            user ? (
              <ProtectedRoute user={user} requireAdmin>
                <Layout user={user} onLogout={handleLogout}>
                  <ModulosGlobalesPage />
                </Layout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/plantillas"
          element={
            user ? (
              <ProtectedRoute user={user} requireAdmin>
                <Layout user={user} onLogout={handleLogout}>
                  <PlantillasPage user={user} />
                </Layout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Workflow-Aprobaciones */}
        <Route
          path="/workflows"
          element={
            user ? (
              <ProtectedRoute user={user} requireAdmin>
                <Layout user={user} onLogout={handleLogout}>
                  <WorkflowsListPage user={user} />
                </Layout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/workflows/new"
          element={
            user ? (
              <ProtectedRoute user={user} requireAdmin>
                <Layout user={user} onLogout={handleLogout}>
                  <WorkflowBuilder user={user} onLogout={handleLogout} />
                </Layout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/workflows/:id/edit"
          element={
            user ? (
              <ProtectedRoute user={user} requireAdmin>
                <Layout user={user} onLogout={handleLogout}>
                  <WorkflowBuilder user={user} onLogout={handleLogout} />
                </Layout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/new-request"
          element={
            user ? (
              <ProtectedRoute user={user} requireExecutor>
                <Layout user={user} onLogout={handleLogout}>
                  <NewRequestPage user={user} />
                </Layout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/inbox"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Inbox user={user} onLogout={handleLogout} />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/auditoria"
          element={
            user ? (
              <ProtectedRoute user={user} requireAdmin>
                <Layout user={user} onLogout={handleLogout}>
                  <AuditoriaPage />
                </Layout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Legacy route - redirect to workflows */}
        <Route
          path="/dashboard"
          element={<Navigate to="/workflows" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
