/**
 * Admin axios instance
 * Uses relative paths so all calls go through Next.js /api/* routes.
 * Automatically attaches the admin JWT from local storage.
 */
import axios from 'axios';

const adminApi = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('admin-auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        const token: string | undefined = parsed?.state?.token;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // ignore storage errors
    }
  }
  return config;
});

export default adminApi;
