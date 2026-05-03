import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Award, Download, Loader2, ReceiptText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentDialog } from './PaymentDialog';
import type { PaymentDetails } from './types';
import { useAttestationFlow } from './useAttestationFlow';

interface AttestationButtonProps {
  formationId: string;
  formationPrix: number; // Ajout du prix
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
    openPaymentDialog,
    closePaymentDialog,
    submitPayment,
    downloadAttestation,
    downloadReceipt,
  } = useAttestationFlow(formationId);

  const isProcessingPayment =
    status === 'processing_payment' || status === 'generating_attestation';
  const isLoading = isCheckingEligibility || isProcessingPayment;

  const handlePrimaryAction = async () => {
    const couldOpen = await openPaymentDialog();

    if (!couldOpen && eligibility && !eligibility.eligible) {
      toast({
        title: 'Non éligible',
        description:
          eligibility.reason || 'Vous ne pouvez pas payer pour le moment.',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentSubmit = async (paymentDetails: PaymentDetails) => {
    try {
      await submitPayment(paymentDetails);

      toast({
        title: 'Paiement enregistré',
        description:
          'Votre paiement a été validé. Vous pouvez maintenant télécharger le reçu.',
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

      // Cas spécial : utilisateur déjà inscrit
      if (message.includes('déjà inscrit')) {
        toast({
          title: 'Déjà inscrit',
          description:
            'Vous êtes déjà inscrit à cette formation. Utilisez les boutons ci-dessous pour télécharger votre attestation et votre reçu.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Échec du paiement',
          description: message,
          variant: 'destructive',
        });
      }
      throw error;
    }
  };

  const handleDownloadAttestation = async () => {
    console.log('Téléchargement attestation - attestation:', attestation);
    if (!attestation) {
      console.log("Pas d'attestation disponible");
      return;
    }

    try {
      console.log('Téléchargement avec ID:', attestation.id);
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

  if (attestation || lastPaiement) {
    return (
      <div className={`flex flex-wrap gap-3 ${className}`}>
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
      </div>
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
            Obtenir mon attestation
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
        isProcessing={isProcessingPayment}
      />
    </>
  );
}
