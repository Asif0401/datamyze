import axios from 'axios';

// In production (Vercel), VITE_API_URL points to Railway backend.
// In dev, Vite proxy handles /api → localhost:5000.
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('dq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Only 401 = expired/invalid token → force re-login
      // 403 = insufficient permissions (e.g. not premium) → let page handle it
      localStorage.removeItem('dq_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
