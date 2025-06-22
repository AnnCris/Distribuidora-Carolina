import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para requests - agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el error es 401, limpiar tokens y redirigir
    if (error.response?.status === 401) {
      console.log('Token expirado o inválido, limpiando sesión...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Redirigir al login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;