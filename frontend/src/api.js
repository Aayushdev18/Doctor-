import axios from 'axios';

const explicitUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const API_URL = explicitUrl;

const api = axios.create({
    baseURL: API_URL ? `${API_URL}/api` : '/api',
    timeout: 20000
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const assetUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
};

export default api;
