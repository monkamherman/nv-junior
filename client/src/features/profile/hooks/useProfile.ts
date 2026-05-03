import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '../../../lib/api';
import type { UpdateProfileData, UserProfile } from '../types';

const PROFILE_QUERY_KEY = 'profile';
const ATTESTATIONS_QUERY_KEY = 'attestations';

export const useProfile = () => {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY],
    queryFn: () => apiGet<UserProfile>('/api/user/profile'),
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    refetchIntervalInBackground: true, // Continuer même si l'onglet n'est pas actif
    staleTime: 25000, // Considérer les données comme périmées après 25 secondes
  });
};

export const useAttestations = () => {
  return useQuery({
    queryKey: [ATTESTATIONS_QUERY_KEY],
    queryFn: () => apiGet<any[]>('/api/attestations/user'),
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    refetchIntervalInBackground: true, // Continuer même si l'onglet n'est pas actif
    staleTime: 25000, // Considérer les données comme périmées après 25 secondes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) =>
      apiPut<UserProfile>('/api/user/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiPut('/api/user/password', data),
  });
};
