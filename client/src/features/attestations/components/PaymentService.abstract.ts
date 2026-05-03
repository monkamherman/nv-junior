import type { PaymentDetails, PaymentResult } from './types';

/**
 * Classe abstraite pour le service de paiement
 * Implémente le pattern Template Method
 */
export abstract class PaymentService {
  /**
   * Méthode abstraite pour simuler un paiement
   * Doit être implémentée par les classes concrètes
   */
  abstract simulatePayment(details: PaymentDetails): Promise<PaymentResult>;

  /**
   * Méthode abstraite pour valider les détails de paiement
   * Doit être implémentée par les classes concrètes
   */
  abstract validatePaymentDetails(details: PaymentDetails): boolean;

  /**
   * Template method pour traiter un paiement
   * Gère la validation et la simulation du paiement
   */
  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    try {
      // Validation des données
      if (!this.validatePaymentDetails(details)) {
        return {
          success: false,
          error: 'Données de paiement invalides',
        };
      }

      // Simulation du paiement
      return await this.simulatePayment(details);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }
}

/**
 * Implémentation concrète pour les paiements Mobile Money
 */
export class MobileMoneyPaymentService extends PaymentService {
  /**
   * Simule un paiement Mobile Money
   */
  async simulatePayment(details: PaymentDetails): Promise<PaymentResult> {
    // Simulation du délai réseau
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Utiliser les propriétés françaises unifiées avec fallback sur les anciennes
    const phoneNumber = details.numeroTelephone || details.phoneNumber || '';
    const amount = details.montant || details.amount || 0;
    const method = details.methode || details.method || 'orange';

    // Simulation de réponse réussie
    console.log(
      `Paiement simulé: ${amount}FCFA via ${method} au ${phoneNumber}`
    );

    return {
      success: true,
      transactionId: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  /**
   * Valide les détails du paiement Mobile Money
   */
  validatePaymentDetails(details: PaymentDetails): boolean {
    const phoneRegex = /^[0-9]{9,15}$/;

    // Utiliser les propriétés françaises unifiées avec fallback sur les anciennes
    const phoneNumber = details.numeroTelephone || details.phoneNumber || '';
    const amount = details.montant || details.amount || 0;
    const method = details.methode || details.method || 'orange';

    return (
      phoneRegex.test(phoneNumber) &&
      amount >= 500 && // Montant minimum
      ['orange', 'mtn'].includes(method)
    );
  }
}

/**
 * Fabrique pour obtenir une instance du service de paiement
 */
export function getPaymentService(): PaymentService {
  // Pour l'instant, on retourne toujours MobileMoneyPaymentService
  // Mais on pourrait facilement ajouter une logique pour choisir le bon service
  return new MobileMoneyPaymentService();
}
