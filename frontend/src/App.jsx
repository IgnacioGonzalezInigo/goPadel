// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import { authService } from './services/api';

// Componente para proteger rutas
function ProtectedRoute({ children, adminOnly = false }) {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas - Solo Admin */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute adminOnly>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Redirect por defecto */}
        <Route 
          path="/" 
          element={
            authService.isAuthenticated() 
              ? <Navigate to="/admin/dashboard" replace /> 
              : <Navigate to="/login" replace />
          } 
        />
        
        {/* 404 - cualquier ruta no encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;