import api from './axios';

export const itineraryAPI = {
  generate: (data) => api.post('/itinerary/generate', data, { timeout: 120000 }),
  getAll: (params) => api.get('/itinerary', { params }),
  getOne: (id) => api.get(`/itinerary/${id}`),
  update: (id, data) => api.put(`/itinerary/${id}`, data),
  delete: (id) => api.delete(`/itinerary/${id}`),
  toggleFavorite: (id) => api.patch(`/itinerary/${id}/favorite`),
  regenerate: (id, data) => api.post(`/itinerary/${id}/regenerate`, data, { timeout: 120000 }),
  chat: (id, question) => api.post(`/itinerary/${id}/chat`, { question }),
  getStats: () => api.get('/itinerary/stats'),
};

export const shareAPI = {
  create: (id) => api.post(`/share/${id}/create`),
  revoke: (id) => api.delete(`/share/${id}/revoke`),
  get: (token) => api.get(`/share/${token}`),
  getQR: (id) => api.get(`/share/${id}/qr`),
};
