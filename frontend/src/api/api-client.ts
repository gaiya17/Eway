/**
 * API Client Configuration
 * Centralized Axios instance with automatic authentication headers and response interceptors.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically injects the JWT from localStorage into every outgoing request.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eway_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Handles authentication failures (401/403) by clearing stale sessions.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const isProfileEndpoint = error.config?.url?.includes('/users/profile');
      if (isProfileEndpoint) {
        // Authenticated session expired/invalid - reset client state
        localStorage.removeItem('eway_token');
        localStorage.removeItem('eway_user');
        localStorage.removeItem('eway_current_page');
        window.location.reload(); 
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

