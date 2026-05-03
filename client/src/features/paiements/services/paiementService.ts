import { api } from '@/lib/api';
import { captureError } from '@/lib/errors';

export type PaiementMethod = 'orange' | 'mtn';

export interface PaiementData {
  formationId: string;
  montant: number;
  methode: PaiementMethod;
  numeroTelephone: string;
}

export interface PaiementRecord {
  id: string;
  reference: string;
  formationId: string;
  montant: number;
  mode:
    | 'ORANGE_MONEY'
    | 'MTN_MONEY'
    | 'CARTE'
    | 'ESPECES'
    | 'VIREMENT'
    | 'SIMULATION';
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'VALIDE' | 'ANNULE' | 'ECHEC';
  datePaiement: string;
  telephone: string;
  operateur?: string;
  utilisateurId: string;
}

interface CreatePaiementResponse {
  paiement: PaiementRecord;
  paymentUrl?: string;
  transactionId?: string;
  simulation?: boolean;
}

class PaiementService {
  async creerPaiement(data: PaiementData): Promise<PaiementRecord> {
    const payload = {
      formationId: data.formationId,
      montant: data.montant,
      telephone: data.numeroTelephone,
      operateur: data.methode === 'orange' ? 'ORANGE_MONEY' : 'MTN_MONEY',
      mode: data.methode === 'orange' ? 'ORANGE_MONEY' : 'MTN_MONEY',
    };

    const response = await api.post<CreatePaiementResponse>(
      '/api/paiements',
      payload
    );
    return response.data.paiement;
  }

  async telechargerRecu(paiementId: string): Promise<void> {
    try {
      const response = await api.get<Blob>(`/api/paiements/${paiementId}/recu`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recu-paiement-${paiementId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      captureError(error, 'payments.receipt');
      throw error;
    }
  }
}

export const paiementService = new PaiementService();
