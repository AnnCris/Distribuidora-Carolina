import axios from 'axios';

// Crear una instancia de axios con la URL base
const API_URL = 'http://localhost:8000/api';

// Crear instancia de axios con configuración
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación a las solicitudes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (No autorizado) y no hemos intentado refrescar el token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar refrescar el token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No hay refresh token, redirigir a login
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken
        });
        
        // Guardar nuevo token
        localStorage.setItem('token', response.data.access);
        
        // Reintentar la solicitud original con el nuevo token
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return apiClient(originalRequest);
      } catch (error) {
        // Si falla el refresh, limpiar tokens y redirigir a login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (username, password) => {
    const response = await apiClient.post('/usuarios/auth/login/', { username, password });
    // Guardar tokens en localStorage
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    return response.data;
  },
  
  logout: async () => {
    try {
      await apiClient.post('/usuarios/auth/logout/');
    } finally {
      // Limpiar localStorage incluso si la solicitud falla
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('usuario');
    }
  },
  
  registro: async (userData) => {
    const response = await apiClient.post('/usuarios/auth/registro/', userData);
    // Guardar tokens en localStorage
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    return response.data;
  },
  
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },
  
  getUsuarioActual: () => {
    const usuarioStr = localStorage.getItem('usuario');
    return usuarioStr ? JSON.parse(usuarioStr) : null;
  }
};

// Servicio para gestionar usuarios
export const usuarioService = {
  getPerfil: async () => {
    const response = await apiClient.get('/usuarios/usuarios/perfil/');
    return response.data;
  },
  
  cambiarPassword: async (usuarioId, passwordData) => {
    const response = await apiClient.post(`/usuarios/usuarios/${usuarioId}/cambiar_password/`, passwordData);
    return response.data;
  },
  
  getUsuarios: async () => {
    const response = await apiClient.get('/usuarios/usuarios/');
    return response.data;
  },
  
  getUsuario: async (id) => {
    const response = await apiClient.get(`/usuarios/usuarios/${id}/`);
    return response.data;
  },
  
  actualizarUsuario: async (id, userData) => {
    const response = await apiClient.put(`/usuarios/usuarios/${id}/`, userData);
    return response.data;
  }
};

// Servicio para roles
export const rolService = {
  getRoles: async () => {
    const response = await apiClient.get('/usuarios/roles/');
    return response.data;
  }
};

export default apiClient;