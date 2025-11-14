import axios from 'axios';

// Always use Railway backend URL (environment variables not working in Vercel)
const API_BASE_URL = 'https://backend-production-c41fe.up.railway.app/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초로 증가 (Railway 콜드 스타트 대응)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;