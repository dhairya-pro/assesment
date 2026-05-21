import api from './axios';

export const uploadAPI = {
  upload: (files, onProgress) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('documents', file));
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    });
  },
  getAll: (params) => api.get('/upload', { params }),
  getOne: (id) => api.get(`/upload/${id}`),
  delete: (id) => api.delete(`/upload/${id}`),
};

export const ocrAPI = {
  extract: (documentId) => api.post(`/ocr/extract/${documentId}`),
  extractBatch: (documentIds) => api.post('/ocr/extract-batch', { documentIds }),
  update: (documentId, data) => api.put(`/ocr/${documentId}`, data),
};
