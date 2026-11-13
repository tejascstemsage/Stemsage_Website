import axios from 'axios';
import { getApiBase } from './apiBase';

const api = axios.create({
  baseURL: getApiBase()
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stemsage_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('stemsage_admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;