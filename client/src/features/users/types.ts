export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'ADMIN' | 'FORMATEUR' | 'APPRENANT';
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  password?: string;
  confirmPassword?: string;
}

export interface UsersFilters {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}
