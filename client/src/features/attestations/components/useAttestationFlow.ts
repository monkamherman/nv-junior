import { axiosInstance } from '@/api/api.config';
import { captureError, getErrorMessage } from '@/lib/errors';
import {
  paiementService,
  type PaiementRecord,
} from '@/features/paiements/services/paiementService';
import { useCallback, useState } from 'react';
import { attestationService } from './PaymentService';
import type {
  Attestation,
  EligibiliteResult,
  PaymentDetails,
  PaymentStatus,
  PaymentSubmitResult,
} from './types';

/**
 * Hook personnalisé pour gérer le flux de génération d'attestation
 */
export function useAttestationFlow(formationId: string) {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [attestation, setAttestation] = useState<Attestation | null>(null);
  const [eligibility, setEligibility] = useState<EligibiliteResult | null>(
    null
  );
  const [existingAttestationId, setExistingAttestationId] = useState<
    string | null
  >(null);
  const [lastPaiement, setLastPaiement] = useState<PaiementRecord | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  /**
   * Vérifie l'éligibilité pour la formation
   */
  const checkEligibility = useCallback(async () => {
    if (!formationId) return false;

    setIsCheckingEligibility(true);
    setError(null);

    try {
      const result = await attestationService.checkEligibility(formationId);
      setEligibility(result);
      if (result.attestation?.id) {
        setExistingAttestationId(result.attestation.id);
      } else {
        setExistingAttestationId(null);
      }

      return result.eligible;
    } catch (err) {
      const normalizedError =
        err instanceof Error
          ? err
          : new Error("Impossible de vérifier l'éligibilité");
      setError(normalizedError);
      return false;
    } finally {
      setIsCheckingEligibility(false);
    }
  }, [formationId]);

  /**
   * Ouvre le dialogue de paiement après vérification d'éligibilité
   */
  const openPaymentDialog = useCallback(async () => {
    if (existingAttestationId) {
      await attestationService.downloadAttestation(existingAttestationId);
      return false;
    }

    const eligible =
      eligibility?.eligible !== undefined
        ? eligibility.eligible
        : await checkEligibility();

    if (!eligible) {
      return false;
    }

    setIsDialogOpen(true);
    setStatus('dialog_open');
    return true;
  }, [checkEligibility, eligibility, existingAttestationId]);

  const closePaymentDialog = useCallback(() => {
    setIsDialogOpen(false);
    setStatus('idle');
  }, []);

  /**
   * Soumet le paiement et génère l'attestation
   */
  const submitPayment = useCallback(
    async (paymentDetails: PaymentDetails): Promise<PaymentSubmitResult> => {
      if (!formationId) {
        throw new Error('Formation introuvable pour le paiement');
      }

      setStatus('processing_payment');
      setError(null);

      try {
        // 1. Sauvegarder le paiement en utilisant le service qui gère la transformation
        const paiement = await paiementService.creerPaiement({
          formationId: paymentDetails.formationId,
          montant: paymentDetails.montant || paymentDetails.amount || 0,
          methode: (paymentDetails.methode || paymentDetails.method) as
            | 'orange'
            | 'mtn',
          numeroTelephone:
            paymentDetails.numeroTelephone || paymentDetails.phoneNumber || '',
        });
        setLastPaiement(paiement);

        // 2. Lancer la génération d'attestation
        setStatus('generating_attestation');
        const { result, attestation: generatedAttestation } =
          await attestationService.processPaymentAndGenerateAttestation(
            paymentDetails
          );

        if (!result.success) {
          throw new Error(
            result.error ||
              "Le paiement a été enregistré mais la génération de l'attestation a échoué."
          );
        }

        if (generatedAttestation) {
          setAttestation(generatedAttestation);
        }

        setStatus('success');
        setIsDialogOpen(false);

        return {
          paiement,
          attestation: generatedAttestation,
        };
      } catch (error: any) {
        captureError(error, 'attestations.flow.submit');

        // Gérer le cas où l'utilisateur est déjà inscrit
        if (
          error.response?.status === 400 &&
          error.response?.data?.details?.alreadyEnrolled
        ) {
          try {
            const response = await axiosInstance.post<{ data: { attestation: Attestation } }>(
              '/api/attestations/generer',
              {
                formationId: paymentDetails.formationId,
              }
            );

            const generatedAttestation = response.data.data.attestation;

            if (generatedAttestation) {
              setAttestation(generatedAttestation);
            }

            setStatus('success');
            setIsDialogOpen(false);

            return {
              paiement: null,
              attestation: generatedAttestation,
            };
          } catch (attestationError) {
            captureError(attestationError, 'attestations.flow.enrolled-generate');
            setError(
              new Error(
                "Vous êtes déjà inscrit mais la génération de l'attestation a échoué. Veuillez contacter le support."
              )
            );
            throw error;
          }
        }

        setError(
          new Error(
            getErrorMessage(
              error,
              'Erreur lors du traitement du paiement. Veuillez réessayer.'
            )
          )
        );
        setStatus('error');
        throw error;
      }
    },
    [formationId]
  );

  /**
   * Télécharge une attestation existante
   */
  const downloadAttestation = useCallback(async (attestationId: string) => {
    try {
      await attestationService.downloadAttestation(attestationId);
    } catch (err) {
      const normalizedError =
        err instanceof Error ? err : new Error('Erreur lors du téléchargement');
      setError(normalizedError);
      throw normalizedError;
    }
  }, []);

  const downloadReceipt = useCallback(
    async (paiementId?: string) => {
      const id = paiementId ?? lastPaiement?.id;
      if (!id) {
        throw new Error('Aucun paiement disponible pour télécharger un reçu.');
      }

      await paiementService.telechargerRecu(id);
    },
    [lastPaiement]
  );

  return {
    // État
    status,
    isDialogOpen,
    isCheckingEligibility,
    error,
    attestation,
    eligibility,
    lastPaiement,

    // Actions
    checkEligibility,
    openPaymentDialog,
    closePaymentDialog,
    submitPayment,
    downloadAttestation,
    downloadReceipt,
    setDialogOpen: setIsDialogOpen,
  };
}
