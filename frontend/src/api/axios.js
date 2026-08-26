/**
 * @file axios.js
 * @description Configured Axios instance for all API calls.
 * - Base URL reads from VITE_API_URL env var (set in .env.local / hosting dashboard)
 * - Attaches JWT token to every request automatically
 * - Auto-redirects to /login on 401 (expired or invalid token)
 */

import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 30000, // 30 second timeout
});

// ─── Request Interceptor — Attach Token ────────────────────────────────────────
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Response Interceptor — Handle 401 ────────────────────────────────────────
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Avoid redirect loop if already on login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    },
);

export default instance;
