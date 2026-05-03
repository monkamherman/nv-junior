import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  genererAttestation,
  getMesAttestations,
  telechargerAttestation,
  verifierEligibilite,
  type AttestationEtendue,
} from '../services/attestationService';

export function useVerifierEligibilite(formationId: string) {
  return useQuery({
    queryKey: ['attestations', 'eligibilite', formationId],
    queryFn: () => verifierEligibilite(formationId),
    enabled: !!formationId, // Ne s'exécute que si formationId est défini
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGenererAttestation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: genererAttestation,
    onSuccess: (_, variables) => {
      // Invalider le cache d'éligibilité pour forcer un rafraîchissement
      queryClient.invalidateQueries({
        queryKey: ['attestations', 'eligibilite', variables],
      });

      // Invalider la liste des attestations
      queryClient.invalidateQueries({
        queryKey: ['attestations', 'mes-attestations'],
      });
    },
  });
}

export function useTelechargerAttestation() {
  return useMutation({
    mutationFn: telechargerAttestation,
    onSuccess: () => {
      // Mettre à jour le statut de l'attestation après téléchargement si nécessaire
    },
  });
}

/**
 * Hook pour récupérer la liste des attestations de l'utilisateur
 */
export function useMesAttestations() {
  return useQuery<AttestationEtendue[]>({
    queryKey: ['attestations', 'mes-attestations'],
    queryFn: getMesAttestations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
