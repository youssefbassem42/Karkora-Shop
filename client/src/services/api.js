import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Separate instance for file uploads (no Content-Type override — let browser set multipart boundary)
const uploadApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000, // longer timeout for large files
});

// Attach JWT token to all requests if present
const attachToken = (config) => {
  const token = localStorage.getItem('karkora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(attachToken);
uploadApi.interceptors.request.use(attachToken);

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('karkora_token');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
};

// ─── Products ───────────────────────────────────
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),             // public, filters: category, search, page, limit
  getAllAdmin: (params) => api.get('/products/all', { params }),     // admin
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/products/${id}/status`, { isActive }),
};

// ─── Orders ─────────────────────────────────────
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getStats: () => api.get('/orders/stats'),
};

// ─── Upload ─────────────────────────────────────
export const uploadAPI = {
  /**
   * Upload images to the server.
   * @param {File[]} files - Array of File objects
   * @param {function} onProgress - Optional progress callback (0-100)
   */
  uploadImages: (files, onProgress) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return uploadApi.post('/upload', formData, {
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
        : undefined,
    });
  },
};

// Resolve a server image path to a full URL for display
export const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;          // external URL
  const base = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';
  return `${base}${path}`;
};

export default api;
