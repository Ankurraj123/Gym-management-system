import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({ baseURL: 'http://localhost:5001/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_token') || localStorage.getItem('tf_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tf_token');
      localStorage.removeItem('tf_admin_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (err.response?.status === 403 && err.response?.data?.suspended) {
      toast.error('Your account has been suspended by Admin. Logging out...');
      localStorage.removeItem('tf_token');
      localStorage.removeItem('tf_admin_token');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }
    return Promise.reject(err);
  }
);

export default api;
