// src/api/api.config.ts
import { captureError, getErrorMessage } from '@/lib/errors';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;
export const AUTH_EXPIRED_EVENT = 'app:auth-expired';

const AUTH_PATHS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout'];

function isAuthRequest(url?: string) {
  return AUTH_PATHS.some((path) => url?.includes(path));
}

function clearStoredAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
}

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: import.meta.env.DEV, // Seulement en développement local
  timeout: 45000, // 45 secondes pour gérer les cold starts de Render + email
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    if (
      (error.code === 'ECONNABORTED' ||
        error.code === 'ECONNRESET' ||
        error.message?.includes('timeout')) &&
      originalRequest &&
      (originalRequest._retryCount || 0) < 3
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      const waitTime = Math.min(3000 * originalRequest._retryCount, 8000);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return axiosInstance(originalRequest);
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('Aucun token de rafraîchissement disponible');
        }

        const response = await axiosInstance.post<{ access: string }>(
          '/api/auth/refresh',
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('token', access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        captureError(refreshError, 'auth.refresh');
        clearStoredAuth();
        window.dispatchEvent(
          new CustomEvent(AUTH_EXPIRED_EVENT, {
            detail: {
              message: getErrorMessage(
                refreshError,
                'Votre session a expire. Veuillez vous reconnecter.'
              ),
            },
          })
        );
      }
    }

    captureError(error, originalRequest?.url || 'http.request');
    return Promise.reject(error);
  }
);

export default axiosInstance;
