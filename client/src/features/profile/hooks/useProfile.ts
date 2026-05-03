import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '../../../lib/api';
import type { UpdateProfileData, UserProfile } from '../types';

const PROFILE_QUERY_KEY = 'profile';
const ATTESTATIONS_QUERY_KEY = 'attestations';

type ProfileAttestation = {
  id: string;
  numero: string;
  urlPdf: string;
  statut: 'GENEREE' | 'ENVOYEE' | 'TELECHARGEE';
  dateEmission: string;
  dateTelechargement?: string;
  inscription: {
    formation: {
      id: string;
      titre: string;
      description: string;
    };
  };
};

type AttestationsApiResponse = {
  success: true;
  message?: string;
  data: {
    attestations: ProfileAttestation[];
  };
};

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
    queryFn: async () => {
      const res = await apiGet<AttestationsApiResponse>(
        '/api/attestations/user'
      );
      return res.data.attestations;
    },
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
