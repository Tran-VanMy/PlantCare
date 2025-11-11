// client/src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', // set env var in .env (VITE_API_BASE_URL)
  timeout: 10000
});

// attach token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

// handle 401 globally (optional)
api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    if (err.response && err.response.status === 401) {
      // clear token and redirect to login if needed
      localStorage.removeItem('token');
      // optional: window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
