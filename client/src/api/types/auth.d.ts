import { User } from '@/contexts/AuthContext';

declare module '@/api' {
  interface LoginResponse {
    access: string;
    refresh: string;
    user: User;
  }

  interface RefreshTokenResponse {
    access: string;
    user: User;
  }

  interface ErrorResponse {
    message: string;
    code?: string;
  }

  interface AuthApi {
    login: (credentials: { email: string; password: string }) => Promise<{ data: LoginResponse }>;
    register: (data: {
      email: string;
      motDePasse: string;
      nom: string;
      prenom: string;
      telephone?: string;
    }) => Promise<{ data: { message: string } }>;
    logout: () => Promise<void>;
    refreshToken: (data: { refresh: string }) => Promise<{ data: RefreshTokenResponse }>;
    verifyOtp: (data: {
      email: string;
      otp: string;
      nom: string;
      prenom: string;
      telephone?: string;
      motDePasse: string;
    }) => Promise<{ data: { success: boolean; message?: string } }>;
  }

  export const authApi: AuthApi;
}
