// src/api/auth.api.ts
import { axiosInstance } from './api.config';
import type {
  LoginResponse,
  RefreshTokenResponse,
  RegisterData,
  VerifyOtpData,
} from './auth.types';

export const authApi = {
  // Envoi des informations d'inscription et demande d'OTP
  register: (data: RegisterData) =>
    axiosInstance.post<{ message: string }>('/api/auth/signup', data),

  // Vérification de l'OTP
  verifyOtp: (data: VerifyOtpData) => {
    // Création d'un objet avec toutes les propriétés requises
    const requestData: Record<string, string> = {
      email: data.email || '',
      otp: data.otp || '',
      nom: data.nom || '',
      prenom: data.prenom || '',
      telephone: data.telephone || '',
      motDePasse: data.motDePasse || '',
    };

    // Vérification des champs obligatoires
    const requiredFields = ['email', 'otp', 'nom', 'prenom', 'motDePasse'];
    const missingFields = requiredFields.filter((field) => !requestData[field]);

    if (missingFields.length > 0) {
      const errorMessage = `Champs manquants: ${missingFields.join(', ')}`;
      console.error('Erreur de validation:', errorMessage);
      return Promise.reject(new Error(errorMessage));
    }

    console.log('Envoi de la requête de vérification OTP:', {
      url: '/api/auth/verify-otp',
      data: requestData,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    return axiosInstance
      .post<{ success: boolean; message?: string }>(
        '/api/auth/verify-otp',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )
      .catch((error) => {
        console.error('Erreur lors de la vérification OTP:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      });
  },

  // Connexion
  login: (data: { email: string; password: string }) =>
    axiosInstance.post<{ success: true; data: LoginResponse }>('/api/auth/login', {
      email: data.email,
      motDePasse: data.password,
    }),

  // Déconnexion
  logout: () =>
    axiosInstance.post(
      '/api/auth/logout',
      {},
      {
        timeout: 5000, // Timeout de 5 secondes
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ),

  // Rafraîchissement du token (à implémenter côté serveur si nécessaire)
  refreshToken: (data: { refresh: string }) =>
    axiosInstance.post<{ success: true; data: RefreshTokenResponse }>('/api/auth/refresh', data),
};
