import { apiGet, apiPost } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const CERTIFICATES_QUERY_KEY = 'certificates';

export interface Certificate {
  id: string;
  dateEmission: string;
  statut: 'GENEREE' | 'ENVOYEE' | 'TELECHARGEE';
  url: string;
  inscription: {
    id: string;
    utilisateur: {
      id: string;
      nom: string;
      prenom: string;
      email: string;
    };
    formation: {
      id: string;
      titre: string;
      dateDebut: string;
      dateFin: string;
    };
  };
}

export const useCertificates = (filters = {}) => {
  return useQuery({
    queryKey: [CERTIFICATES_QUERY_KEY, filters],
    queryFn: () =>
      apiGet<Certificate[]>('/api/dashboard/certificates', { params: filters }),
  });
};

export const useGenerateCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inscriptionId: string) =>
      apiPost<Certificate>('/api/dashboard/certificates/generate', {
        inscriptionId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CERTIFICATES_QUERY_KEY] });
    },
  });
};

export const useSendCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (certificateId: string) =>
      apiPost(`/api/dashboard/certificates/${certificateId}/send`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CERTIFICATES_QUERY_KEY] });
    },
  });
};
