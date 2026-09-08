import axios from 'axios';

const explicitUrl = import.meta.env.VITE_API_URL;
export const API_URL = explicitUrl || (import.meta.env.DEV ? '' : 'http://localhost:4000');

const api = axios.create({
    baseURL: API_URL ? `${API_URL}/api` : '/api',
    timeout: 8000
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
