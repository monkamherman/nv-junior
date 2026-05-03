import { User } from '@/contexts/AuthContext';

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshTokenResponse {
  access: string;
  user: User;
}

export interface RegisterData {
  email: string;
  motDePasse: string;
  nom: string;
  prenom: string;
  telephone?: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
  nom: string;
  prenom: string;
  telephone?: string;
  motDePasse: string;
  [key: string]: string | undefined; // Pour permettre l'accès par index
}

export interface AuthApi {
  login: (credentials: { email: string; password: string }) => Promise<{ data: LoginResponse }>;
  register: (data: RegisterData) => Promise<{ data: { message: string } }>;
  logout: () => Promise<void>;
  refreshToken: (data: { refresh: string }) => Promise<{ data: RefreshTokenResponse }>;
  verifyOtp: (data: VerifyOtpData) => Promise<{ data: { success: boolean; message?: string } }>;
}
