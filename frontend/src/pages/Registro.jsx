import React, { useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Registro.css';
import logoCircular from '../assets/distribuidora.png';

const Registro = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password2: '',
    rol: 2, // Fijamos el rol a 2 (Cliente)
    persona: {
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      telefono: '',
      direccion: '',
      email: '',
      ci: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Manejar campos anidados (persona)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      // Manejar campos de primer nivel
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verificar que las contraseñas coincidan
      if (formData.password !== formData.password2) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/usuarios/auth/registro/`, 
        formData
      );

      // Guardar tokens en localStorage
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      // Guardar información del usuario
      localStorage.setItem('user', JSON.stringify(response.data.usuario));
      
      // Configurar encabezado de autorización para futuras peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      // Mostrar mensaje de éxito
      alert('¡Registro exitoso! Bienvenido a Distribuidora Carolina');
      
      // Redirigir al dashboard de clientes
      navigate('/client-dashboard');
    } catch (err) {
      console.error('Error de registro:', err);
      
      if (err.response?.data) {
        // Formatear mensajes de error desde la API
        const apiErrors = err.response.data;
        let errorMsg = '';
        
        Object.keys(apiErrors).forEach(key => {
          if (typeof apiErrors[key] === 'object') {
            Object.keys(apiErrors[key]).forEach(subKey => {
              errorMsg += `${subKey}: ${apiErrors[key][subKey]}\n`;
            });
          } else {
            errorMsg += `${key}: ${apiErrors[key]}\n`;
          }
        });
        
        setError(errorMsg || 'Error en el registro. Por favor, revise los datos ingresados.');
      } else {
        setError('Ha ocurrido un error al registrarse. Por favor, intente más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-form">
        <div className="registro-header">
          <img src={logoCircular} alt="Distribuidora Carolina" className="registro-logo" />
          <h2 className="registro-title">Registro de Usuario</h2>
        </div>
        
        <div className="registro-body">
          <div className="registro-company-name">
            DISTRIBUIDORA DE QUESOS "CAROLINA"
          </div>
          
          {error && (
            <div className="error-message">
              {error.split('\n').map((line, i) => (
                line ? <div key={i}>{line}</div> : null
              ))}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Información Personal</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="persona.nombres" className="form-label">
                    Nombres:
                  </label>
                  <input
                    type="text"
                    id="persona.nombres"
                    name="persona.nombres"
                    className="form-input"
                    value={formData.persona.nombres}
                    onChange={handleChange}
                    placeholder="Ingrese sus nombres"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="persona.apellido_paterno" className="form-label">
                    Apellido Paterno:
                  </label>
                  <input
                    type="text"
                    id="persona.apellido_paterno"
                    name="persona.apellido_paterno"
                    className="form-input"
                    value={formData.persona.apellido_paterno}
                    onChange={handleChange}
                    placeholder="Ingrese su apellido paterno"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="persona.apellido_materno" className="form-label">
                  Apellido Materno:
                </label>
                <input
                  type="text"
                  id="persona.apellido_materno"
                  name="persona.apellido_materno"
                  className="form-input"
                  value={formData.persona.apellido_materno}
                  onChange={handleChange}
                  placeholder="Ingrese su apellido materno (opcional)"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="persona.ci" className="form-label">
                    Carnet de Identidad:
                  </label>
                  <input
                    type="text"
                    id="persona.ci"
                    name="persona.ci"
                    className="form-input"
                    value={formData.persona.ci}
                    onChange={handleChange}
                    placeholder="Ej: 12345678 o 12345678-LP"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="persona.telefono" className="form-label">
                    Teléfono:
                  </label>
                  <input
                    type="text"
                    id="persona.telefono"
                    name="persona.telefono"
                    className="form-input"
                    value={formData.persona.telefono}
                    onChange={handleChange}
                    placeholder="8 dígitos"
                    maxLength="8"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="persona.email" className="form-label">
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  id="persona.email"
                  name="persona.email"
                  className="form-input"
                  value={formData.persona.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="persona.direccion" className="form-label">
                  Dirección:
                </label>
                <input
                  type="text"
                  id="persona.direccion"
                  name="persona.direccion"
                  className="form-input"
                  value={formData.persona.direccion}
                  onChange={handleChange}
                  placeholder="Ingrese su dirección completa"
                  required
                />
              </div>
            </div>
            
            <div className="form-section">
              <h3>Información de Cuenta</h3>
              
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
                  placeholder="Entre 4 y 20 caracteres"
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
                    placeholder="Mínimo 8 caracteres con letra, número y símbolo"
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
              
              <div className="form-group">
                <label htmlFor="password2" className="form-label">
                  Confirmar Contraseña:
                </label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="password2"
                    name="password2"
                    className="form-input"
                    value={formData.password2}
                    onChange={handleChange}
                    placeholder="Repita la contraseña"
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="registro-btn btn-registro"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Crear Cuenta'}
            </button>
            
            <div className="login-link">
              ¿Ya tienes una cuenta? <Link to="/login">Iniciar Sesión</Link>
            </div>
            
            <div className="home-link">
              <Link to="/">Volver al inicio</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registro;