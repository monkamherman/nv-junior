import { axiosInstance } from '@/api/api.config';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

type ApiResponse<T = unknown> = Promise<T>;

export const api: AxiosInstance = axiosInstance;

// Fonctions utilitaires pour les appels API
export const apiGet = <T>(url: string, config?: AxiosRequestConfig): ApiResponse<T> => 
  api.get<T>(url, config).then((res) => res.data);

export const apiPost = <T, D = unknown>(
  url: string, 
  data?: D, 
  config?: AxiosRequestConfig
): ApiResponse<T> =>
  api.post<T>(url, data, config).then((res) => res.data);

export const apiPut = <T, D = unknown>(
  url: string, 
  data?: D, 
  config?: AxiosRequestConfig
): ApiResponse<T> =>
  api.put<T>(url, data, config).then((res) => res.data);

export const apiDelete = <T = void>(
  url: string, 
  config?: AxiosRequestConfig
): ApiResponse<T> =>
  api.delete<T>(url, config).then((res) => res.data);

export const apiPatch = <T, D = unknown>(
  url: string, 
  data?: D, 
  config?: AxiosRequestConfig
): ApiResponse<T> =>
  api.patch<T>(url, data, config).then((res) => res.data);
