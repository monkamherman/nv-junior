import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import type { User, UserFilters } from '../../../api/user.api';
import { userApi } from '../../../api/user.api';

const USERS_QUERY_KEY = 'users';

type UsersResponse = User[];

export const useUsers = (filters: UserFilters = {}) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, filters],
    queryFn: async () => {
      try {
        console.log('Fetching users with filters:', filters);
        const response = await userApi.getUsers(filters);
        console.log('Users response:', response);
        return response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
    retry: 1,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, id],
    queryFn: () => userApi.getUser(id).then((response: AxiosResponse<User>) => response.data),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => 
      userApi.createUser(userData).then((response: AxiosResponse<User>) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...userData }: Partial<User> & { id: string }) => 
      userApi.updateUser(id, userData).then((response: AxiosResponse<User>) => response.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
};
