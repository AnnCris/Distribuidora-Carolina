import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Registro from './pages/Registro';
import NosotrosPage from './pages/NosotrosPage';
import Login from './pages/Login';
import AdminDashboard from './components/AdminDashboard.jsx';
import DashboardClient from './components/DashboardClient.jsx';
import './App.css';

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    // Si no hay token, redirigir al login
    return <Navigate to="/login" replace />;
  }
  
  return element;
};

// Verificación de rol
const RoleCheck = ({ element, allowedRoles }) => {
  const userData = localStorage.getItem('user');
  
  if (!userData) {
    return <Navigate to="/login" replace />;
  }
  
  const user = JSON.parse(userData);
  
  if (!allowedRoles.includes(user.rol.rol_id)) {
    // Si el usuario no tiene el rol permitido, redirigir según su rol
    if (user.rol.rol_id === 1) {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.rol.rol_id === 2) {
      return <Navigate to="/client-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  
  return element;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        {/* Páginas en construcción */}
        <Route path="/productos" element={
          <div className="construction-page">
            <h1>Página de Productos</h1>
            <p>Esta sección está en construcción.</p>
            <button onClick={() => window.history.back()}>Volver</button>
          </div>
        } />
        
        <Route path="/ofertas" element={
          <div className="construction-page">
            <h1>Ofertas Especiales</h1>
            <p>Esta sección está en construcción.</p>
            <button onClick={() => window.history.back()}>Volver</button>
          </div>
        } />
        
        <Route path="/contactos" element={
          <div className="construction-page">
            <h1>Contactos</h1>
            <p>Esta sección está en construcción.</p>
            <button onClick={() => window.history.back()}>Volver</button>
          </div>
        } />
        
        {/* Rutas protegidas con verificación de rol */}
        <Route 
          path="/admin-dashboard" 
          element={
            <PrivateRoute 
              element={<RoleCheck element={<AdminDashboard />} allowedRoles={[1]} />} 
            />
          } 
        />
        
        <Route 
          path="/client-dashboard" 
          element={
            <PrivateRoute 
              element={<RoleCheck element={<DashboardClient />} allowedRoles={[2]} />} 
            />
          } 
        />

        {/* Ruta para página no encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;