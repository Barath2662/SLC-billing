import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

// Bills
export const billAPI = {
  create: (data) => api.post('/bills/create', data),
  getAll: (page = 1, limit = 20) => api.get(`/bills?page=${page}&limit=${limit}`),
  getByNumber: (billNumber) => api.get(`/bills/${encodeURIComponent(billNumber)}`),
  update: (billNumber, data) => api.put(`/bills/update/${encodeURIComponent(billNumber)}`, data),
  delete: (billNumber) => api.delete(`/bills/${encodeURIComponent(billNumber)}`),
  search: (query) => api.get(`/bills/search?q=${encodeURIComponent(query)}`),
  filter: (params) => api.get('/bills/filter', { params }),
  getPDF: (billNumber) => api.get(`/bills/${encodeURIComponent(billNumber)}/pdf`, { responseType: 'blob' }),
  getInvoiceHtml: (billNumber) => api.get(`/bills/${encodeURIComponent(billNumber)}/invoice`, { responseType: 'text' }),
  getDashboard: () => api.get('/bills/dashboard'),
  getCustomers: () => api.get('/bills/customers'),
};

export default api;
