import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const nominationService = {
  submitNomination: async (data) => {
    const response = await api.post('/nominations', data);
    return response.data;
  },
  
  getNomination: async (id) => {
    const response = await api.get(`/nominations/${id}`);
    return response.data;
  },
  
  updateNomination: async (id, data) => {
    const response = await api.put(`/nominations/${id}`, data);
    return response.data;
  },
  
  deleteNomination: async (id) => {
    const response = await api.delete(`/nominations/${id}`);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  uploadFile: async (file, fieldName, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldName', fieldName);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
    return response.data;
  }
};

export default api;
