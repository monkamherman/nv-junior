import type { PaiementRecord } from '@/features/paiements/services/paiementService';

// Types pour les méthodes de paiement (français unifié)
export type MethodePaiement = 'orange' | 'mtn';

export interface DetailsPaiement {
  methode: MethodePaiement;
  numeroTelephone: string;
  montant: number;
  formationId: string;
  // Propriétés pour rétrocompatibilité (transition)
  phoneNumber?: string;
  amount?: number;
  method?: MethodePaiement;
}

// Alias pour rétrocompatibilité (à supprimer progressivement)
export type PaymentMethod = MethodePaiement;
export type PaymentDetails = DetailsPaiement;

export interface EligibiliteResult {
  eligible: boolean;
  attestation?: {
    id: string;
    urlPdf: string;
    dateEmission: string;
  };
  reason?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  attestationId?: string; // ID de l'attestation générée
  error?: string;
}

export type PaymentStatus =
  | 'idle'
  | 'dialog_open'
  | 'processing_payment'
  | 'generating_attestation'
  | 'success'
  | 'error';

// Alias pour rétrocompatibilité
export type PaymentData = Omit<PaymentDetails, 'formationId'>;

export interface PaymentSubmitResult {
  paiement: PaiementRecord | null; // Permettre null pour les utilisateurs déjà inscrits
  attestation?: Attestation;
}

// Réponse d'éligibilité (ancien type, à supprimer après migration)
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

// Modèle d'attestation
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

// Props pour le composant AttestationButton
export interface AttestationButtonProps {
  formationId: string;
  className?: string;
  onSuccess?: (attestation: Attestation) => void;
  onError?: (error: Error) => void;
}

// Props pour le composant PaymentDialog
export interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSubmit: (data: PaymentDetails) => Promise<PaiementRecord>;
  formationId: string;
  defaultAmount?: number;
  isProcessing?: boolean;
}
