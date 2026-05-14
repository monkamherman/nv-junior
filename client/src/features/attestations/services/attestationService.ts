import { api } from '@/lib/api';
import { captureError } from '@/lib/errors';
import type { PaymentProgressStatus } from '@/features/paiements/services/paiementService';

export interface AttestationEtendue extends Attestation {
  inscription: {
    id: string;
    dateInscription: string;
    formation: {
      id: string;
      titre: string;
      description: string;
      dateDebut: string;
      dateFin: string;
      prix: number;
    };
  };
}
export interface Attestation {
  id: string;
  numero: string;
  urlPdf: string;
  statut: 'GENEREE' | 'ENVOYEE' | 'TELECHARGEE';
  dateEmission: string;
  dateTelechargement?: string;
}

export interface EligibiliteResponse {
  eligible: boolean;
  canMakePayment?: boolean;
  canGenerateAttestation?: boolean;
  attestation?: Attestation;
  reason?: string;
  paymentStatus?: PaymentProgressStatus;
  dateFin?: string;
  inscription?: {
    id: string;
    dateInscription: string;
  };
}

export const verifierEligibilite = async (
  formationId: string
): Promise<EligibiliteResponse> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: EligibiliteResponse;
    }>(`/api/attestations/verifier-eligibilite/${formationId}`);
    return response.data.data;
  } catch (error) {
    captureError(error, 'attestations.eligibility');
    throw error;
  }
};

export const genererAttestation = async (
  formationId: string
): Promise<Attestation> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: { attestation: Attestation };
    }>(`/api/attestations/generer/${formationId}`);
    return response.data.data.attestation;
  } catch (error) {
    captureError(error, 'attestations.generate');
    throw error;
  }
};

export const getMesAttestations = async (): Promise<AttestationEtendue[]> => {
  try {
    const response = await api.get<{
      success: boolean;
      message?: string;
      data: { attestations: AttestationEtendue[] };
    }>('/api/attestations');
    return response.data.data.attestations;
  } catch (error) {
    captureError(error, 'attestations.list');
    throw error;
  }
};

export const telechargerAttestation = async (
  attestationId: string
): Promise<void> => {
  try {
    const response = await api.get<Blob>(
      `/api/attestations/${attestationId}/telecharger`,
      {
        responseType: 'blob',
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attestation-${attestationId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    captureError(error, 'attestations.download');
    throw error;
  }
};
