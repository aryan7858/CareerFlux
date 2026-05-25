import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://careerflux-backend.vercel.app/api';
export const SERVER_URL = API_BASE_URL.replace(/\/api$/, '');

// Base API instance — uses Vite proxy in dev, direct URL in production
const API = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('careerflux_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses globally (expired/invalid token)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('careerflux_token');
            localStorage.removeItem('careerflux_user');
            // Only redirect if not already on login/register page
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
    register: (data) => API.post('/auth/register', data),
    login: (data) => API.post('/auth/login', data),
    getMe: () => API.get('/auth/me'),
    updateProfile: (data) => API.put('/auth/me', data),
    changePassword: (data) => API.put('/auth/change-password', data),
};

// ── Jobs API ──────────────────────────────────────────────────────────────────
export const jobsAPI = {
    getAll: (params) => API.get('/jobs', { params }),
    getById: (id) => API.get(`/jobs/${id}`),
    create: (data) => API.post('/jobs', data),
    update: (id, data) => API.put(`/jobs/${id}`, data),
    delete: (id) => API.delete(`/jobs/${id}`),
    getEmployerJobs: (params) => API.get('/jobs/employer/my-jobs', { params }),
};

// ── Applications API ──────────────────────────────────────────────────────────
export const applicationsAPI = {
    apply: (data) => API.post('/applications', data),
    getMyApplications: (params) => API.get('/applications/my', { params }),
    getJobApplications: (jobId, params) => API.get(`/applications/job/${jobId}`, { params }),
    updateStatus: (id, data) => API.put(`/applications/${id}/status`, data),
    replyToApplication: (id, data) => API.put(`/applications/${id}/reply`, data),
    getEmployersList: () => API.get('/applications/employers'),
    transferApplication: (id, data) => API.put(`/applications/${id}/transfer`, data),
    getAssignedApplications: () => API.get('/applications/assigned'),
    scheduleInterview: (id, data) => API.put(`/applications/${id}/interview`, data),
    cancelInterview: (id) => API.delete(`/applications/${id}/interview`),
};

// ── Resumes API ───────────────────────────────────────────────────────────────
export const resumesAPI = {
    upload: (formData) => API.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getMy: () => API.get('/resumes/my'),
    download: (id) => API.get(`/resumes/download/${id}`, { responseType: 'blob' }),
    delete: () => API.delete('/resumes/my'),
    viewUrl: (id) => {
        const token = localStorage.getItem('careerflux_token');
        const baseURL = API_BASE_URL;
        return `${baseURL}/resumes/view/${id}?token=${token}`;
    },
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminAPI = {
    getStats: () => API.get('/admin/stats'),
    getUsers: (params) => API.get('/admin/users', { params }),
    updateUserStatus: (id, data) => API.put(`/admin/users/${id}/status`, data),
    deleteUser: (id) => API.delete(`/admin/users/${id}`),
    createEmployer: (data) => API.post('/admin/users/employer', data),
    getJobs: (params) => API.get('/admin/jobs', { params }),
    updateJobStatus: (id, data) => API.put(`/admin/jobs/${id}/status`, data),
    deleteJob: (id) => API.delete(`/admin/jobs/${id}`),
    getApplications: (params) => API.get('/admin/applications', { params }),
    deleteApplication: (id) => API.delete(`/admin/applications/${id}`),
    getPendingVerifications: () => API.get('/admin/verifications'),
    reviewVerification: (userId, status) => API.put(`/admin/verifications/${userId}`, { status }),
    downloadVerificationDoc: (userId) => API.get(`/admin/verifications/download/${userId}`, { responseType: 'blob' }),
};

// ── Notifications API ─────────────────────────────────────────────────────────
export const notificationsAPI = {
    getAll: () => API.get('/notifications'),
    markAsRead: (id) => API.put(`/notifications/${id}/read`),
    markAllAsRead: () => API.put('/notifications/read-all'),
};

// ── AI Integration API ────────────────────────────────────────────────────────
export const aiAPI = {
    getRecommendations: () => API.get('/ai/recommendations'),
    screenApplicants: (jobId) => API.get(`/ai/screen-applicants/${jobId}`),
    getMatchDetails: (applicationId) => API.get(`/ai/match-details/${applicationId}`),
};

// ── Profile Extensions API ───────────────────────────────────────────────────
export const profileAPI = {
    uploadPortfolio: (formData) => API.post('/profile/portfolio/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deletePortfolio: (projectId) => API.delete(`/profile/portfolio/${projectId}`),
    toggleEndorsement: (userId, skill) => API.post(`/profile/users/${userId}/endorse/${skill}`),
    requestVerification: (formData) => API.post('/profile/verify/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default API;
