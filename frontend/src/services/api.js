import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mosque API
export const mosqueAPI = {
  getAll: () => api.get('/mosques'),
  getById: (id) => api.get(`/mosques/${id}`),
  create: (data) => api.post('/mosques', data),
  uploadDonationQR: (mosqueId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/mosques/${mosqueId}/donation-qr`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (formData) => api.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Prayer Times API
export const prayerTimesAPI = {
  get: (mosqueId, date) => api.get(`/prayer-times/${mosqueId}`, { params: { date } }),
  setManual: (data) => api.post('/prayer-times', data),
};

// Posts API
export const postsAPI = {
  getAll: (mosqueId, status) => api.get('/posts', { params: { mosque_id: mosqueId, status } }),
  create: (adminId, mosqueId, formData) => 
    api.post(`/posts?admin_id=${adminId}&mosque_id=${mosqueId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getPending: () => api.get('/posts/pending'),
  updateStatus: (postId, status) => api.patch(`/posts/${postId}/status`, { status }),
};

// User API
export const userAPI = {
  getPendingAdmins: () => api.get('/users/pending'),
  getIdProof: (userId) => api.get(`/users/${userId}/id-proof`),
  updateStatus: (userId, status) => api.patch(`/users/${userId}/status?status=${status}`),
  addFavorite: (userId, mosqueId) => api.post(`/users/${userId}/favorites/${mosqueId}`),
  removeFavorite: (userId, mosqueId) => api.delete(`/users/${userId}/favorites/${mosqueId}`),
  getFavorites: (userId) => api.get(`/users/${userId}/favorites`),
};

export default api;