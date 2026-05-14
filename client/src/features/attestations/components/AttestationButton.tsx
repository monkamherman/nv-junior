import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Award, Download, Loader2, ReceiptText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentDialog } from './PaymentDialog';
import type { PaymentDetails } from './types';
import { useAttestationFlow } from './useAttestationFlow';

interface AttestationButtonProps {
  formationId: string;
  formationPrix: number;
  className?: string;
}

export function AttestationButton({
  formationId,
  formationPrix,
  className = '',
}: AttestationButtonProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    status,
    isDialogOpen,
    isCheckingEligibility,
    attestation,
    eligibility,
    lastPaiement,
    paymentProgress,
    openPaymentDialog,
    closePaymentDialog,
    submitPayment,
    downloadAttestation,
    downloadReceipt,
  } = useAttestationFlow(formationId);

  const isProcessingPayment =
    status === 'processing_payment' || status === 'generating_attestation';
  const isLoading = isCheckingEligibility || isProcessingPayment;
  const hasPartialPayment = (paymentProgress?.paidAmount ?? 0) > 0;
  const canPayAnotherInstallment =
    !!paymentProgress &&
    !paymentProgress.isFullyPaid &&
    !paymentProgress.hasPendingPayment;

  const handlePrimaryAction = async () => {
    try {
      const couldOpen = await openPaymentDialog();

      if (!couldOpen && eligibility && !eligibility.eligible) {
        toast({
          title: 'Information',
          description:
            eligibility.reason || 'Vous ne pouvez pas payer pour le moment.',
          variant: 'default',
        });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Action impossible pour le moment.';
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handlePaymentSubmit = async (paymentDetails: PaymentDetails) => {
    try {
      const result = await submitPayment(paymentDetails);

      if (result.attestation) {
        toast({
          title: 'Attestation disponible',
          description:
            'Votre paiement est complet. Vous pouvez maintenant télécharger votre attestation.',
        });
        return;
      }

      if (result.paymentStatus?.isFullyPaid) {
        toast({
          title: 'Paiement complet',
          description: result.paymentStatus.formationEnded
            ? 'Le paiement est complet. L’attestation est en cours de préparation.'
            : 'Le paiement est complet. L’attestation sera disponible à la fin de la formation.',
        });
        return;
      }

      if (result.paymentStatus) {
        toast({
          title: 'Paiement partiel enregistré',
          description: `Reste à payer : ${result.paymentStatus.remainingAmount.toLocaleString('fr-FR')} FCFA.`,
        });
        return;
      }

      toast({
        title: 'Paiement enregistré',
        description: 'Votre paiement a été enregistré avec succès.',
      });
    } catch (error) {
      const responsePayload = (error as { response?: { data?: unknown } })
        .response?.data as
        | {
            code?: string;
            message?: string;
          }
        | undefined;

      const message =
        error instanceof Error
          ? error.message
          : 'Le paiement a échoué. Veuillez réessayer.';

      if (responsePayload?.code === 'ATTESTATION_FORMATION_NOT_FINISHED') {
        toast({
          title: 'Attestation indisponible',
          description:
            responsePayload.message ||
            "La formation n'est pas encore terminée. L'attestation sera disponible après la date de fin.",
          variant: 'default',
        });
        navigate(`/formations/${formationId}`);
        throw error;
      }

      toast({
        title: 'Échec du paiement',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDownloadAttestation = async () => {
    if (!attestation) {
      return;
    }

    try {
      await downloadAttestation(attestation.id);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de télécharger l'attestation.";
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      await downloadReceipt();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Aucun reçu disponible pour ce paiement.';
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    }
  };

  if (attestation || lastPaiement || hasPartialPayment) {
    return (
      <>
        <div className={`flex flex-col gap-3 ${className}`}>
          {paymentProgress && (
            <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <p>
                Déjà payé: {paymentProgress.paidAmount.toLocaleString('fr-FR')}{' '}
                FCFA
              </p>
              <p>
                Reste à payer:{' '}
                {paymentProgress.remainingAmount.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {attestation && (
              <Button
                onClick={handleDownloadAttestation}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Télécharger mon attestation
              </Button>
            )}
            {lastPaiement && (
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleDownloadReceipt}
              >
                <ReceiptText className="h-4 w-4" />
                Reçu de paiement
              </Button>
            )}
            {canPayAnotherInstallment && (
              <Button
                type="button"
                variant="secondary"
                className="flex items-center gap-2"
                onClick={handlePrimaryAction}
              >
                <Award className="h-4 w-4" />
                Payer une autre tranche
              </Button>
            )}
          </div>
        </div>

        <PaymentDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              closePaymentDialog();
            }
          }}
          onPaymentSubmit={handlePaymentSubmit}
          formationId={formationId}
          formationPrix={formationPrix}
          remainingAmount={paymentProgress?.remainingAmount}
          isProcessing={isProcessingPayment}
        />
      </>
    );
  }

  if (eligibility && eligibility.eligible === false && eligibility.reason) {
    return (
      <Button disabled className={className}>
        <Award className="mr-2 h-4 w-4" />
        {eligibility.reason}
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handlePrimaryAction}
        disabled={isLoading}
        className={`flex items-center gap-2 ${className}`}
        data-payment-button
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <Award className="h-4 w-4" />
            {hasPartialPayment
              ? 'Payer une tranche'
              : 'Je souscris a la formation'}
          </>
        )}
      </Button>

      <PaymentDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closePaymentDialog();
          }
        }}
        onPaymentSubmit={handlePaymentSubmit}
        formationId={formationId}
        formationPrix={formationPrix}
        remainingAmount={paymentProgress?.remainingAmount}
        isProcessing={isProcessingPayment}
      />
    </>
  );
}
