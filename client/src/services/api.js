import axios from 'axios';

// Set up base Axios configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '', // Configured via VITE_API_BASE_URL in production, or fallback to dev proxy
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

export const localDevLogin = async (email) => {
  const response = await API.post('/api/auth/local-dev-login', { email });
  return response.data;
};

export const createAdminNomination = async (data) => {
  const response = await API.post('/api/admin/nominations', data);
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

  const response = await API.post('/api/upload', formData, {
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

export const setAwardResult = async (id, awardResult, revocationReason = '') => {
  const response = await API.put(`/api/admin/nominations/${id}/award-result`, { awardResult, revocationReason });
  return response.data;
};

export const saveReviewAssessment = async (id, reviewers) => {
  const response = await API.put(`/api/admin/nominations/${id}/review`, { reviewers });
  return response.data;
};

export const resendNomineeApproval = async (id) => {
  const response = await API.post(`/api/admin/nominations/${id}/resend-approval`);
  return response.data;
};

export const setNominationWindow = async (startAt, endAt) => {
  const response = await API.put('/api/admin/nomination-window', { startAt, endAt });
  return response.data;
};

export const respondToNomineeApproval = async (token, decision) => {
  const response = await API.post(`/api/nominee-approval/${encodeURIComponent(token)}`, { decision });
  return response.data;
};

export const getNomineeApproval = async (token) => {
  const response = await API.get(`/api/nominee-approval/${encodeURIComponent(token)}`);
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await API.get('/api/leaderboard');
  return response.data;
};

export const getNominationStatus = async () => {
  const response = await API.get('/api/nomination-status');
  return response.data;
};

export default {
  sendOTP,
  verifyOTP,
  googleAuthUser,
  getAllNominations,
  createAdminNomination,
  submitNomination,
  getNomination,
  updateNomination,
  getCategories,
  uploadFile,
  lookupMemberByEmail,
  sendOtp,
  verifyOtp,
  verifyNomination,
  setAwardResult,
  resendNomineeApproval,
  setNominationWindow,
  getNomineeApproval,
  respondToNomineeApproval,
  getLeaderboard,
  getNominationStatus,
};

