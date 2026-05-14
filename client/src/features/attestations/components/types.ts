import type {
  PaiementRecord,
  PaymentProgressStatus,
} from '@/features/paiements/services/paiementService';

export type MethodePaiement = 'orange' | 'mtn';

export interface DetailsPaiement {
  methode: MethodePaiement;
  numeroTelephone: string;
  montant: number;
  formationId: string;
  phoneNumber?: string;
  amount?: number;
  method?: MethodePaiement;
}

export type PaymentMethod = MethodePaiement;
export type PaymentDetails = DetailsPaiement;

export interface EligibiliteResult {
  eligible: boolean;
  canMakePayment?: boolean;
  canGenerateAttestation?: boolean;
  attestation?: {
    id: string;
    urlPdf: string;
    dateEmission: string;
  };
  reason?: string;
  paymentStatus?: PaymentProgressStatus;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  attestationId?: string;
  error?: string;
}

export type PaymentStatus =
  | 'idle'
  | 'dialog_open'
  | 'processing_payment'
  | 'generating_attestation'
  | 'success'
  | 'error';

export type PaymentData = Omit<PaymentDetails, 'formationId'>;

export interface PaymentSubmitResult {
  paiement: PaiementRecord | null;
  attestation?: Attestation;
  paymentStatus?: PaymentProgressStatus;
}

export interface EligibilityResponse {
  eligible: boolean;
  message: string;
  attestation?: Attestation;
  dateFin?: string;
  inscription?: {
    id: string;
    dateInscription: string;
  };
}

export interface Attestation {
  id: string;
  numero: string;
  urlPdf: string;
  statut: 'GENEREE' | 'ENVOYEE' | 'TELECHARGEE';
  dateEmission: string;
  dateTelechargement?: string;
  inscription?: {
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

export interface AttestationButtonProps {
  formationId: string;
  className?: string;
  onSuccess?: (attestation: Attestation) => void;
  onError?: (error: Error) => void;
}

export interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSubmit: (data: PaymentDetails) => Promise<PaiementRecord>;
  formationId: string;
  defaultAmount?: number;
  isProcessing?: boolean;
}
