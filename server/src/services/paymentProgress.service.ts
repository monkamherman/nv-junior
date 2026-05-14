import type { StatutInscription } from "@prisma/client";
import prisma from "../lib/prisma";

export interface PaymentProgress {
  formationId: string;
  formationPrice: number;
  paidAmount: number;
  remainingAmount: number;
  isFullyPaid: boolean;
  hasPendingPayment: boolean;
  validatedPaymentsCount: number;
  pendingPaymentsCount: number;
  inscriptionStatus: StatutInscription | null;
  formationEnded: boolean;
  canGenerateAttestation: boolean;
}

export async function getPaymentProgress(
  utilisateurId: string,
  formationId: string,
): Promise<PaymentProgress | null> {
  const [formation, paiements, inscription] = await Promise.all([
    prisma.formation.findUnique({
      where: { id: formationId },
      select: { id: true, prix: true, dateFin: true },
    }),
    prisma.paiement.findMany({
      where: {
        utilisateurId,
        formationId,
      },
      select: {
        montant: true,
        statut: true,
      },
    }),
    prisma.inscription.findFirst({
      where: {
        utilisateurId,
        formationId,
      },
      select: {
        statut: true,
      },
    }),
  ]);

  if (!formation) {
    return null;
  }

  const paidAmount = paiements
    .filter((paiement) => paiement.statut === "VALIDE")
    .reduce((total, paiement) => total + paiement.montant, 0);
  const pendingPaymentsCount = paiements.filter((paiement) =>
    ["EN_ATTENTE", "EN_COURS"].includes(paiement.statut),
  ).length;
  const validatedPaymentsCount = paiements.filter(
    (paiement) => paiement.statut === "VALIDE",
  ).length;
  const remainingAmount = Math.max(formation.prix - paidAmount, 0);
  const isFullyPaid = remainingAmount <= 0.0001;
  const formationEnded = new Date() >= new Date(formation.dateFin);

  return {
    formationId: formation.id,
    formationPrice: formation.prix,
    paidAmount,
    remainingAmount,
    isFullyPaid,
    hasPendingPayment: pendingPaymentsCount > 0,
    validatedPaymentsCount,
    pendingPaymentsCount,
    inscriptionStatus: inscription?.statut ?? null,
    formationEnded,
    canGenerateAttestation: isFullyPaid && formationEnded,
  };
}
