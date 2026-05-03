import { api } from '@/lib/api';
import { captureError } from '@/lib/errors';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

export type PaiementStatut =
  | 'EN_ATTENTE'
  | 'EN_COURS'
  | 'VALIDE'
  | 'ANNULE'
  | 'ECHEC';

// Types
export type PaiementData = {
  formationId: string;
  montant: number;
  telephone: string;
  operateur: 'ORANGE_MONEY' | 'MTN_MONEY';
  mode: 'ORANGE_MONEY' | 'MTN_MONEY';
};

export type PaiementResponse = {
  id: string;
  reference: string;
  montant: number;
  statut: PaiementStatut;
  datePaiement: string;
  telephone: string;
  operateur: string;
  formation?: {
    id: string;
    titre: string;
    description?: string;
    prix?: number;
  };
};

type CreatePaiementApiResponse = {
  paiement: PaiementResponse;
  paymentUrl?: string;
  transactionId?: string;
  simulation?: boolean;
};

type PaiementApiResponse = {
  paiement: PaiementResponse;
};

type PaiementsApiResponse = {
  paiements: PaiementResponse[];
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

function unwrapResponse<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as { data?: unknown }).data !== undefined
  ) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

// Créer un nouveau paiement
export const createPaiement = async (
  data: PaiementData
): Promise<PaiementResponse> => {
  try {
    const response = await api.post('/api/paiements', data);
    const unwrapped = unwrapResponse<CreatePaiementApiResponse>(response.data);
    return unwrapped.paiement;
  } catch (error) {
    captureError(error, 'payments.create');
    throw error;
  }
};

// Obtenir le statut d'un paiement
export const getPaiementStatus = async (
  reference: string
): Promise<PaiementResponse> => {
  try {
    const response = await api.get(`/api/paiements/${reference}/statut`);
    const unwrapped = unwrapResponse<PaiementApiResponse>(response.data);
    return unwrapped.paiement;
  } catch (error) {
    captureError(error, 'payments.status');
    throw error;
  }
};

// Lister les paiements de l'utilisateur
export const getPaiementsUtilisateur = async (): Promise<
  PaiementResponse[]
> => {
  try {
    const response = await api.get('/api/paiements');
    const unwrapped = unwrapResponse<PaiementsApiResponse>(response.data);
    return unwrapped.paiements;
  } catch (error) {
    captureError(error, 'payments.list');
    throw error;
  }
};

// Hook pour créer un paiement
export const useCreatePaiement = () => {
  return useMutation({
    mutationFn: createPaiement,
  });
};

// Hook pour obtenir le statut d'un paiement
export const usePaiementStatus = (
  reference: string,
  options?: Omit<
    UseQueryOptions<PaiementResponse, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaiementResponse, Error>({
    queryKey: ['paiement', reference],
    queryFn: () => getPaiementStatus(reference),
    enabled: !!reference,
    refetchInterval: (query) => {
      // Arrêter le rafraîchissement si le paiement est terminé
      const data = query.state.data as PaiementResponse | undefined;
      return data?.statut === 'EN_ATTENTE' || data?.statut === 'EN_COURS'
        ? 3000
        : false;
    },
    ...options,
  });
};

// Hook pour lister les paiements de l'utilisateur
export const usePaiementsUtilisateur = () => {
  return useQuery<PaiementResponse[], Error>({
    queryKey: ['paiements'],
    queryFn: getPaiementsUtilisateur,
  });
};
