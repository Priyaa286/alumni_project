import axios from 'axios';

// Set up base Axios configuration
const API = axios.create({
  baseURL: '', // Empty base URL is routed through Vite dev server proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Auth token and role header from localStorage if available
API.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth_user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
      if (parsed.user?.role) {
        config.headers['x-user-role'] = parsed.user.role;
      }
    } catch (e) {
      console.error('Error parsing stored auth in API interceptor', e);
    }
  }
  return config;
});

export const sendOTP = async (email) => {
  const response = await API.post('/api/auth/send-otp', { email });
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await API.post('/api/auth/verify-otp', { email, otp });
  return response.data;
};

export const googleAuthUser = async (googleData) => {
  const response = await API.post('/api/auth/google', googleData);
  return response.data;
};

export const getAllNominations = async () => {
  const response = await API.get('/api/admin/nominations');
  return response.data;
};

export const sendNominationInvitations = async () => {
  const response = await API.post('/api/admin/nomination-invitations');
  return response.data;
};

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

export const lookupMemberByEmail = async (email) => {
  const response = await API.get(`/api/members/lookup?email=${encodeURIComponent(email)}`);
  return response.data;
};

export const sendOtp = async (email) => {
  const response = await API.post('/api/otp/send-otp', { email });
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await API.post('/api/otp/verify-otp', { email, otp });
  return response.data;
};

export const verifyNomination = async (id, data) => {
  const response = await API.put(`/api/admin/nominations/${id}/verify`, data);
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await API.get('/api/leaderboard');
  return response.data;
};

export default {
  sendOTP,
  verifyOTP,
  googleAuthUser,
  getAllNominations,
  sendNominationInvitations,
  submitNomination,
  getNomination,
  updateNomination,
  getCategories,
  uploadFile,
  lookupMemberByEmail,
  sendOtp,
  verifyOtp,
  verifyNomination,
  getLeaderboard,
};
