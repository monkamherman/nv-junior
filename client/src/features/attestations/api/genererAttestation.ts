import { api } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

interface GenererAttestationParams {
  formationId: string;
  userId: string;
}

export const useGenererAttestation = () => {
  return useMutation({
    mutationFn: async ({ formationId, userId }: GenererAttestationParams) => {
      const { data } = await api.post(`/api/attestations/generer`, {
        formationId,
        userId,
      });
      return data;
    },
    onSuccess: (data) => {
      // Télécharger le fichier PDF
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    },
  });
};
