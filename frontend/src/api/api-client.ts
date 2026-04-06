import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Auth token to headers
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

// Interceptor to handle auth errors — auto-clear stale token & redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const isProfileEndpoint = error.config?.url?.includes('/users/profile');
      if (isProfileEndpoint) {
        // Stale/expired token — clear and redirect to login
        localStorage.removeItem('eway_token');
        localStorage.removeItem('eway_user');
        localStorage.removeItem('eway_current_page');
        window.location.reload(); // Will land on 'home' since no saved page
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

