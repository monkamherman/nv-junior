import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface VerifierEligibiliteParams {
  formationId: string;
  userId: string;
}

export const useVerifierEligibilite = (params: VerifierEligibiliteParams) => {
  return useQuery({
    queryKey: ['verifierEligibilite', params.formationId, params.userId],
    queryFn: async () => {
      const { data } = await api.get('/api/attestations/verifier-eligibilite', {
        params,
      });
      return data;
    },
    enabled: !!params.formationId && !!params.userId,
  });
};
