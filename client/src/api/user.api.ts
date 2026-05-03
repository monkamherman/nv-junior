import { api } from '../lib/api';

export type User = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'ADMIN' | 'FORMATEUR' | 'APPRENANT';
  createdAt: string;
  updatedAt: string;
};

export type UserFilters = {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
};

export const userApi = {
  // Récupérer tous les utilisateurs avec filtres
  getUsers: (filters?: UserFilters) =>
    api.get<User[]>('/api/dashboard/users', { params: filters }),

  // Récupérer un utilisateur par son ID
  getUser: (id: string) => api.get<User>(`/api/dashboard/users/${id}`),

  // Créer un nouvel utilisateur
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<User>('/api/dashboard/users', userData),

  // Mettre à jour un utilisateur
  updateUser: (
    id: string,
    userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
  ) => api.put<User>(`/api/dashboard/users/${id}`, userData),

  // Supprimer un utilisateur
  deleteUser: (id: string) =>
    api.delete<{ success: boolean }>(`/api/dashboard/users/${id}`),
};
