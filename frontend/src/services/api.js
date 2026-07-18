import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT token into header requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => {
  return Promise.reject(err);
});

// API endpoint mappings
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  demoLogin: () => API.post('/auth/demo-login'),
  fetchMe: () => API.get('/auth/me'),
  verifyEmail: (token) => API.get(`/auth/verify/${token}`)
};

export const profileAPI = {
  get: () => API.get('/profile'),
  update: (data) => API.put('/profile', data)
};

export const resumeAPI = {
  list: () => API.get('/resumes'),
  create: (data) => API.post('/resumes', data),
  get: (id) => API.get(`/resumes/${id}`),
  update: (id, data) => API.put(`/resumes/${id}`, data),
  delete: (id) => API.delete(`/resumes/${id}`),
  duplicate: (id) => API.post(`/resumes/${id}/duplicate`),
  getVersions: (id) => API.get(`/resumes/${id}/versions`),
  restoreVersion: (id, verId) => API.post(`/resumes/${id}/versions/${verId}/restore`),
  getPdfUrl: (id) => `${API.defaults.baseURL}/resumes/${id}/pdf?token=${localStorage.getItem('token')}`,
  getDocxUrl: (id) => `${API.defaults.baseURL}/resumes/${id}/docx?token=${localStorage.getItem('token')}`
};

export const atsAPI = {
  scan: (resumeId, data) => API.post(`/ats/scan/${resumeId}`, data),
  compare: (data) => API.post('/ats/compare', data)
};

export const aiAPI = {
  summary: (data) => API.post('/ai/summary', data),
  improveBullets: (data) => API.post('/ai/improve-bullets', data),
  suggestSkills: (data) => API.post('/ai/suggest-skills', data),
  suggestCertifications: (data) => API.post('/ai/suggest-certifications', data),
  createCoverLetter: (data) => API.post('/ai/cover-letter', data),
  getCoverLetters: () => API.get('/ai/cover-letters'),
  deleteCoverLetter: (id) => API.delete(`/ai/cover-letters/${id}`),
  careerRoadmap: (data) => API.post('/ai/career-roadmap', data),
  interviewPrep: (data) => API.post('/ai/interview-prep', data),
  chat: (data) => API.post('/ai/chat', data)
};

export const integrationsAPI = {
  github: (username) => API.post('/integrations/github', { username }),
  linkedin: (url) => API.post('/integrations/linkedin', { url })
};

export const adminAPI = {
  stats: () => API.get('/admin/stats'),
  users: () => API.get('/admin/users'),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  apiUsage: () => API.get('/admin/api-usage')
};

export default API;
