import { captureError, getErrorMessage } from '@/lib/errors';
import {
  paiementService,
  type PaiementRecord,
  type PaymentProgressStatus,
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

export function useAttestationFlow(formationId: string) {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [attestation, setAttestation] = useState<Attestation | null>(null);
  const [eligibility, setEligibility] = useState<EligibiliteResult | null>(null);
  const [existingAttestationId, setExistingAttestationId] = useState<
    string | null
  >(null);
  const [lastPaiement, setLastPaiement] = useState<PaiementRecord | null>(null);
  const [paymentProgress, setPaymentProgress] =
    useState<PaymentProgressStatus | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  const checkEligibility = useCallback(async () => {
    if (!formationId) return null;

    setIsCheckingEligibility(true);
    setError(null);

    try {
      const result = await attestationService.checkEligibility(formationId);
      setEligibility(result);
      setPaymentProgress(result.paymentStatus ?? null);
      if (result.attestation?.id) {
        setExistingAttestationId(result.attestation.id);
      } else {
        setExistingAttestationId(null);
      }

      return result;
    } catch (err) {
      const normalizedError =
        err instanceof Error
          ? err
          : new Error("Impossible de vérifier l'éligibilité");
      setError(normalizedError);
      return null;
    } finally {
      setIsCheckingEligibility(false);
    }
  }, [formationId]);

  const openPaymentDialog = useCallback(async () => {
    if (existingAttestationId) {
      await attestationService.downloadAttestation(existingAttestationId);
      return false;
    }

    const result = eligibility ?? (await checkEligibility());

    if (!result) {
      return false;
    }

    if (result.canGenerateAttestation) {
      setStatus('generating_attestation');
      const generatedAttestation = await attestationService.generateAttestation(
        formationId
      );
      setAttestation(generatedAttestation);
      setStatus('success');
      return false;
    }

    if (result.canMakePayment === false || !result.eligible) {
      return false;
    }

    setIsDialogOpen(true);
    setStatus('dialog_open');
    return true;
  }, [checkEligibility, eligibility, existingAttestationId, formationId]);

  const closePaymentDialog = useCallback(() => {
    setIsDialogOpen(false);
    setStatus('idle');
  }, []);

  const submitPayment = useCallback(
    async (paymentDetails: PaymentDetails): Promise<PaymentSubmitResult> => {
      if (!formationId) {
        throw new Error('Formation introuvable pour le paiement');
      }

      setStatus('processing_payment');
      setError(null);

      try {
        const paymentResponse = await paiementService.creerPaiement({
          formationId: paymentDetails.formationId,
          montant: paymentDetails.montant || paymentDetails.amount || 0,
          methode: (paymentDetails.methode || paymentDetails.method) as
            | 'orange'
            | 'mtn',
          numeroTelephone:
            paymentDetails.numeroTelephone || paymentDetails.phoneNumber || '',
        });

        const { paiement, paymentStatus: updatedPaymentStatus } = paymentResponse;
        setLastPaiement(paiement);
        setPaymentProgress(updatedPaymentStatus ?? null);

        let generatedAttestation: Attestation | undefined;

        if (updatedPaymentStatus?.canGenerateAttestation) {
          setStatus('generating_attestation');
          generatedAttestation = await attestationService.generateAttestation(
            paymentDetails.formationId
          );
          setAttestation(generatedAttestation);
        }

        const refreshedEligibility = await attestationService.checkEligibility(
          paymentDetails.formationId
        );
        setEligibility(refreshedEligibility);
        setPaymentProgress(refreshedEligibility.paymentStatus ?? updatedPaymentStatus ?? null);
        if (refreshedEligibility.attestation?.id) {
          setExistingAttestationId(refreshedEligibility.attestation.id);
        }

        setStatus('success');
        setIsDialogOpen(false);

        return {
          paiement,
          attestation: generatedAttestation,
          paymentStatus: updatedPaymentStatus,
        };
      } catch (error: unknown) {
        captureError(error, 'attestations.flow.submit');
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
    status,
    isDialogOpen,
    isCheckingEligibility,
    error,
    attestation,
    eligibility,
    lastPaiement,
    paymentProgress,
    checkEligibility,
    openPaymentDialog,
    closePaymentDialog,
    submitPayment,
    downloadAttestation,
    downloadReceipt,
    setDialogOpen: setIsDialogOpen,
  };
}
