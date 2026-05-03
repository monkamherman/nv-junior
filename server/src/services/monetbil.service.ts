import axios, { AxiosError } from "axios";
import crypto from "crypto";

// Configuration Monetbil depuis les variables d'environnement
const MONETBIL_API_KEY = process.env.MONETBIL_API_KEY || "";
const MONETBIL_SERVICE_ID = process.env.MONETBIL_SERVICE_ID || "";
const MONETBIL_SERVICE_SECRET = process.env.MONETBIL_SERVICE_SECRET || "";
const MONETBIL_BASE_URL =
  process.env.MONETBIL_BASE_URL || "https://api.monetbil.com";
const MONETBIL_WEBHOOK_URL = process.env.MONETBIL_WEBHOOK_URL || "";
const MONETBIL_ENABLED = process.env.MONETBIL_ENABLED || "";

// Interface pour la réponse de création de paiement
export interface MonetbilPaymentResponse {
  success: boolean;
  message?: string;
  payment_url?: string;
  transaction_id?: string;
  error?: string;
}

// Interface pour les données de webhook
export interface MonetbilWebhookData {
  transaction_id: string;
  status: string;
  phone: string;
  operator: string;
  amount: number;
  currency: string;
  reference: string;
  signature?: string;
}

// Interface pour le statut de transaction
export interface MonetbilTransactionStatus {
  transaction_id: string;
  status: "pending" | "success" | "failed" | "cancelled";
  amount: number;
  phone: string;
  operator: string;
  created_at: string;
  updated_at: string;
}

/**
 * Service d'intégration Monetbil pour les paiements mobile money
 */
export class MonetbilService {
  private apiKey: string;
  private serviceId: string;
  private serviceSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = MONETBIL_API_KEY;
    this.serviceId = MONETBIL_SERVICE_ID;
    this.serviceSecret = MONETBIL_SERVICE_SECRET;
    this.baseUrl = MONETBIL_BASE_URL;
  }

  /**
   * Vérifie si le service est configuré correctement
   */
  isConfigured(): boolean {
    const isProd = process.env.NODE_ENV === "production";
    const isEnabled = MONETBIL_ENABLED === "true" || MONETBIL_ENABLED === "1";

    if (!isProd && !isEnabled) {
      return false;
    }

    return !!(this.apiKey && this.serviceId && this.serviceSecret);
  }

  /**
   * Génère la signature pour les requêtes Monetbil
   */
  private generateSignature(params: Record<string, string | number>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    return crypto
      .createHmac("sha256", this.serviceSecret)
      .update(sortedParams)
      .digest("hex");
  }

  /**
   * Crée une demande de paiement Monetbil
   * @param amount - Montant du paiement
   * @param phone - Numéro de téléphone du client
   * @param reference - Référence unique du paiement
   * @param operator - Opérateur mobile (MTN, ORANGE)
   * @param description - Description du paiement
   * @returns URL de paiement et ID de transaction
   */
  async createPayment(
    amount: number,
    phone: string,
    reference: string,
    operator: string,
    description: string,
  ): Promise<MonetbilPaymentResponse> {
    console.log("[Monetbil] Création d'un paiement:", {
      amount,
      phone,
      reference,
      operator,
    });

    // Vérifier la configuration
    if (!this.isConfigured()) {
      console.error("[Monetbil] Service non configuré - clés API manquantes");
      return {
        success: false,
        error:
          "Service Monetbil non configuré. Vérifiez les variables d'environnement.",
      };
    }

    // Normaliser le numéro de téléphone (format international)
    const normalizedPhone = this.normalizePhoneNumber(phone);
    console.log("[Monetbil] Numéro normalisé:", normalizedPhone);

    // Mapper l'opérateur vers le format Monetbil
    const monetbilOperator = this.mapOperator(operator);
    console.log("[Monetbil] Opérateur mappé:", monetbilOperator);

    try {
      const params: Record<string, string | number> = {
        service_id: this.serviceId,
        amount: Math.round(amount),
        phone: normalizedPhone,
        reference: reference,
        operator: monetbilOperator,
        description: description,
        currency: "XAF",
      };

      // Ajouter l'URL de webhook si configurée
      if (MONETBIL_WEBHOOK_URL) {
        params.webhook_url = MONETBIL_WEBHOOK_URL;
      }

      // Générer la signature
      const signature = this.generateSignature(params);
      console.log("[Monetbil] Signature générée");

      const response = await axios.post(
        `${this.baseUrl}/api/v1/payment`,
        {
          ...params,
          signature,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        },
      );

      console.log("[Monetbil] Réponse reçue:", response.data);

      if (response.data && response.data.success) {
        return {
          success: true,
          payment_url: response.data.payment_url || response.data.redirect_url,
          transaction_id: response.data.transaction_id,
          message: response.data.message,
        };
      }

      return {
        success: false,
        error:
          response.data.message || "Erreur lors de la création du paiement",
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error(
        "[Monetbil] Erreur lors de la création du paiement:",
        axiosError.message,
      );

      if (axiosError.response) {
        console.error(
          "[Monetbil] Détails de l'erreur:",
          axiosError.response.data,
        );
        return {
          success: false,
          error: axiosError.response.data?.message || axiosError.message,
        };
      }

      return {
        success: false,
        error: axiosError.message || "Erreur de connexion au service Monetbil",
      };
    }
  }

  /**
   * Vérifie le statut d'une transaction
   * @param transactionId - ID de la transaction Monetbil
   * @returns Statut de la transaction
   */
  async checkTransactionStatus(
    transactionId: string,
  ): Promise<MonetbilTransactionStatus | null> {
    console.log("[Monetbil] Vérification du statut:", transactionId);

    if (!this.isConfigured()) {
      console.error("[Monetbil] Service non configuré");
      return null;
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/transaction/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 15000,
        },
      );

      if (response.data && response.data.success) {
        return {
          transaction_id: response.data.transaction_id,
          status: response.data.status,
          amount: response.data.amount,
          phone: response.data.phone,
          operator: response.data.operator,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
        };
      }

      return null;
    } catch (error: unknown) {
      const err = error as Error;
      console.error("[Monetbil] Erreur vérification statut:", err.message);
      return null;
    }
  }

  /**
   * Vérifie la signature d'un webhook pour sécurité
   * @param data - Données du webhook
   * @param receivedSignature - Signature reçue
   * @returns true si la signature est valide
   */
  verifyWebhookSignature(
    data: MonetbilWebhookData,
    receivedSignature: string,
  ): boolean {
    const params: Record<string, string | number> = {
      transaction_id: data.transaction_id,
      status: data.status,
      phone: data.phone,
      operator: data.operator,
      amount: data.amount,
      currency: data.currency,
      reference: data.reference,
    };

    const expectedSignature = this.generateSignature(params);
    return expectedSignature === receivedSignature;
  }

  /**
   * Normalise un numéro de téléphone au format international
   * @param phone - Numéro de téléphone
   * @returns Numéro normalisé
   */
  private normalizePhoneNumber(phone: string): string {
    // Supprimer les espaces et caractères spéciaux
    let cleaned = phone.replace(/[\s\-.()]/g, "");

    // Si le numéro commence par 0, ajouter le préfixe Cameroun
    if (cleaned.startsWith("0")) {
      cleaned = "237" + cleaned.substring(1);
    }

    // Si le numéro ne commence pas par + ou un indicatif, ajouter +237
    if (!cleaned.startsWith("+") && !cleaned.startsWith("237")) {
      cleaned = "237" + cleaned;
    }

    // Supprimer le + si présent
    if (cleaned.startsWith("+")) {
      cleaned = cleaned.substring(1);
    }

    return cleaned;
  }

  /**
   * Mappe l'opérateur local vers le format Monetbil
   * @param operator - Opérateur local
   * @returns Code opérateur Monetbil
   */
  private mapOperator(operator: string): string {
    const operatorMap: Record<string, string> = {
      MTN_MONEY: "MTN",
      ORANGE_MONEY: "ORANGE",
      MTN: "MTN",
      ORANGE: "ORANGE",
      mtn: "MTN",
      orange: "ORANGE",
    };

    return operatorMap[operator] || operator.toUpperCase();
  }

  /**
   * Effectue un remboursement (si supporté par le compte)
   * @param transactionId - ID de la transaction à rembourser
   * @param amount - Montant à rembourser
   * @returns Résultat du remboursement
   */
  async refund(transactionId: string, amount?: number): Promise<boolean> {
    console.log("[Monetbil] Demande de remboursement:", transactionId);

    if (!this.isConfigured()) {
      return false;
    }

    try {
      const params: Record<string, string | number> = {
        transaction_id: transactionId,
      };

      if (amount) {
        params.amount = Math.round(amount);
      }

      const signature = this.generateSignature(params);

      const response = await axios.post(
        `${this.baseUrl}/api/v1/refund`,
        {
          ...params,
          signature,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 15000,
        },
      );

      return response.data && response.data.success;
    } catch (error: unknown) {
      const err = error as Error;
      console.error("[Monetbil] Erreur remboursement:", err.message);
      return false;
    }
  }
}

// Instance par défaut du service
export const monetbilService = new MonetbilService();

export default monetbilService;
