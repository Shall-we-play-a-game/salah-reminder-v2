import axios from 'axios';

const API_URL = 'https://prayerpal-14.preview.emergentagent.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (formData) => {
    const response = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const mosqueAPI = {
  getAll: async () => {
    const response = await api.get('/mosques');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/mosques/${id}`);
    return response.data;
  },
  
  uploadDonationQR: async (mosqueId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/mosques/${mosqueId}/donation-qr`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const prayerTimesAPI = {
  get: async (mosqueId, date) => {
    const response = await api.get(`/prayer-times/${mosqueId}`, { params: { date } });
    return response.data;
  },
  
  setManual: async (data) => {
    const response = await api.post('/prayer-times', data);
    return response.data;
  },
};

export const postsAPI = {
  getAll: async (mosqueId, status) => {
    const response = await api.get('/posts', { params: { mosque_id: mosqueId, status } });
    return response.data;
  },
  
  create: async (adminId, mosqueId, formData) => {
    const response = await api.post(`/posts?admin_id=${adminId}&mosque_id=${mosqueId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getPending: async () => {
    const response = await api.get('/posts/pending');
    return response.data;
  },
  
  updateStatus: async (postId, status) => {
    const response = await api.patch(`/posts/${postId}/status`, { status });
    return response.data;
  },
};

export const userAPI = {
  getPendingAdmins: async () => {
    const response = await api.get('/users/pending');
    return response.data;
  },
  
  getIdProof: async (userId) => {
    const response = await api.get(`/users/${userId}/id-proof`);
    return response.data;
  },
  
  updateStatus: async (userId, status) => {
    const response = await api.patch(`/users/${userId}/status?status=${status}`);
    return response.data;
  },
  
  addFavorite: async (userId, mosqueId) => {
    const response = await api.post(`/users/${userId}/favorites/${mosqueId}`);
    return response.data;
  },
  
  removeFavorite: async (userId, mosqueId) => {
    const response = await api.delete(`/users/${userId}/favorites/${mosqueId}`);
    return response.data;
  },
  
  getFavorites: async (userId) => {
    const response = await api.get(`/users/${userId}/favorites`);
    return response.data;
  },
};

export default api;