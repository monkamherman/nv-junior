import { api } from '@/lib/api';
import { captureError } from '@/lib/errors';

// Types
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
  attestation?: Attestation;
  reason?: string;
  dateFin?: string;
  inscription?: {
    id: string;
    dateInscription: string;
  };
}

// Fonctions de service
export const verifierEligibilite = async (
  formationId: string
): Promise<EligibiliteResponse> => {
  try {
    const response = await api.get<{
      eligible: boolean;
      attestation?: Attestation;
      reason?: string;
    }>(`/api/attestations/verifier-eligibilite/${formationId}`);
    return response.data;
  } catch (error) {
    captureError(error, 'attestations.eligibility');
    throw error;
  }
};

export const genererAttestation = async (
  formationId: string
): Promise<Attestation> => {
  try {
    const response = await api.post<{ attestation: Attestation }>(
      `/api/attestations/generer/${formationId}`
    );
    return response.data.attestation;
  } catch (error) {
    captureError(error, 'attestations.generate');
    throw error;
  }
};

// Récupérer la liste des attestations de l'utilisateur
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
