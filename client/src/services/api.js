import axios from 'axios';

// Set up base Axios configuration
const API = axios.create({
  baseURL: '', // Empty base URL is routed through Vite dev server proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

export const submitNomination = async (data) => {
  const response = await API.post('/api/nominations', data);
  return response.data;
};

export const getNomination = async (id) => {
  const response = await API.get(`/api/nominations/${id}`);
  return response.data;
};

export const updateNomination = async (id, data) => {
  const response = await API.put(`/api/nominations/${id}`, data);
  return response.data;
};

export const getCategories = async () => {
  const response = await API.get('/api/categories');
  return response.data;
};

export const uploadFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return response.data;
};

export default {
  submitNomination,
  getNomination,
  updateNomination,
  getCategories,
  uploadFile,
};
