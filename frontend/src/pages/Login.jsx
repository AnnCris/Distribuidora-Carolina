import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';
import logoCircular from '../assets/distribuidora.png';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/usuarios/auth/login/`, 
        formData
      );

      // Almacenar tokens en localStorage
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      // Almacenar información del usuario
      localStorage.setItem('user', JSON.stringify(response.data.usuario));

      // Configurar encabezado de autorización para futuras peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      // Redireccionar según el rol del usuario
      if (response.data.usuario.rol.rol_id === 1) {
        navigate('/admin-dashboard');
      } else if (response.data.usuario.rol.rol_id === 2) {
        navigate('/client-dashboard');
      } else {
        navigate('/'); // Fallback al home
      }
    } catch (err) {
      console.error('Error de inicio de sesión:', err);
      setError(
        err.response?.data?.error || 
        'Ha ocurrido un error al iniciar sesión. Por favor, verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/registro');
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <img src={logoCircular} alt="Distribuidora Carolina" className="login-logo" />
          <h2 className="login-title">Iniciar Sesión</h2>
        </div>
        
        <div className="login-body">
          <div className="login-company-name">
            DISTRIBUIDORA DE QUESOS "CAROLINA"
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Nombre de Usuario:
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ingrese su nombre de usuario"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña:
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingrese su contraseña"
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="login-btn btn-login"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
            
            <button 
              type="button" 
              className="login-btn btn-register"
              onClick={handleRegisterClick}
            >
              Registrarse
            </button>
            
            <div className="forgot-password">
              <Link to="/recuperar-password">¿Olvidaste tu contraseña?</Link>
            </div>
            
            <div className="return-home">
              <Link to="/">Volver al inicio</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;