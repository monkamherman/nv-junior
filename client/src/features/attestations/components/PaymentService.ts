import { axiosInstance } from '@/api/api.config';
import { captureError } from '@/lib/errors';
import type { Attestation, EligibiliteResult } from './types';

const API_BASE_URL = '/api/attestations';

export class AttestationService {
  async checkEligibility(formationId: string): Promise<EligibiliteResult> {
    try {
      const response = await axiosInstance.get<{ data: EligibiliteResult }>(
        `${API_BASE_URL}/verifier-eligibilite/${formationId}`
      );

      return response.data.data;
    } catch (error) {
      captureError(error, 'attestations.flow.eligibility');
      throw new Error(
        "Impossible de vérifier l'éligibilité. Veuillez réessayer."
      );
    }
  }

  async generateAttestation(formationId: string): Promise<Attestation> {
    try {
      const response = await axiosInstance.post<{ data: { attestation: Attestation } }>(
        `${API_BASE_URL}/generer`,
        {
          formationId,
        }
      );

      return response.data.data.attestation;
    } catch (error) {
      captureError(error, 'attestations.flow.generate');
      throw error;
    }
  }

  async downloadAttestation(attestationId: string): Promise<void> {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/${attestationId}/telecharger`,
        {
          responseType: 'blob',
        }
      );

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attestation-${attestationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      captureError(error, 'attestations.flow.download');
      throw new Error(
        "Impossible de télécharger l'attestation. Veuillez réessayer."
      );
    }
  }
}

export const attestationService = new AttestationService();
